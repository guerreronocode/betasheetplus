
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for recent data first
    const { data: dbRates, error: dbError } = await supabaseClient
      .from('yield_rates')
      .select('*')
      .order('reference_date', { ascending: false })
      .limit(10)

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Check if we have recent data (less than 6 hours old for yield rates)
    if (dbRates && dbRates.length > 0) {
      const lastUpdate = new Date(dbRates[0].last_update)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceUpdate < 6) {
        console.log('Returning cached yield rates data')
        const latestRates = []
        const rateTypes = ['selic', 'cdi', 'ipca']
        
        for (const rateType of rateTypes) {
          const rate = dbRates.find(r => r.rate_type === rateType)
          if (rate) latestRates.push(rate)
        }
        
        return new Response(
          JSON.stringify(latestRates),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    console.log('Fetching fresh yield rates data from BACEN API...')

    try {
      // SELIC - Taxa básica de juros (série 432)
      const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
      const selicData = await selicResponse.json()
      
      // CDI - Certificados de Depósito Interbancário (série 12)
      const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json')
      const cdiData = await cdiResponse.json()
      
      // IPCA - Índice de preços (série 433) - últimos 12 meses para calcular acumulado
      const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
      const ipcaData = await ipcaResponse.json()

      console.log(`Fetched SELIC: ${selicData?.length || 0} entries, CDI: ${cdiData?.length || 0} entries, IPCA: ${ipcaData?.length || 0} entries`)

      const ratesToStore = []

      // Process SELIC data
      if (selicData && Array.isArray(selicData) && selicData.length > 0) {
        const latestSelic = selicData[selicData.length - 1]
        if (latestSelic.data && latestSelic.valor) {
          const dateParts = latestSelic.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          
          ratesToStore.push({
            rate_type: 'selic',
            rate_value: parseFloat(latestSelic.valor),
            reference_date: date,
            periodicity: 'daily'
          })
        }
      }

      // Process CDI data
      if (cdiData && Array.isArray(cdiData) && cdiData.length > 0) {
        const latestCdi = cdiData[cdiData.length - 1]
        if (latestCdi.data && latestCdi.valor) {
          const dateParts = latestCdi.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          
          ratesToStore.push({
            rate_type: 'cdi',
            rate_value: parseFloat(latestCdi.valor),
            reference_date: date,
            periodicity: 'daily'
          })
        }
      }

      // Process IPCA data - calculate 12-month accumulated
      if (ipcaData && Array.isArray(ipcaData) && ipcaData.length >= 12) {
        let accumulated = 1
        const last12Months = ipcaData.slice(-12)
        
        for (const month of last12Months) {
          if (month.valor) {
            const monthlyRate = parseFloat(month.valor) / 100
            accumulated *= (1 + monthlyRate)
          }
        }
        
        const annualRate = (accumulated - 1) * 100
        const latestIpca = ipcaData[ipcaData.length - 1]
        
        if (latestIpca.data) {
          const dateParts = latestIpca.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-01` // First day of month
          
          ratesToStore.push({
            rate_type: 'ipca',
            rate_value: annualRate,
            reference_date: date,
            periodicity: 'monthly'
          })
        }
      }

      // Store rates in database
      for (const rate of ratesToStore) {
        try {
          await supabaseClient
            .from('yield_rates')
            .upsert(rate, {
              onConflict: 'rate_type,reference_date'
            })
        } catch (error) {
          console.error(`Error storing ${rate.rate_type} data:`, error)
        }
      }

      // Store in history table for trend analysis
      const currentDate = new Date().toISOString().split('T')[0]
      for (const rate of ratesToStore) {
        try {
          await supabaseClient
            .from('yield_rates_history')
            .upsert({
              rate_type: rate.rate_type,
              rate_value: rate.rate_value,
              reference_date: currentDate
            }, {
              onConflict: 'rate_type,reference_date'
            })
        } catch (error) {
          console.error(`Error storing ${rate.rate_type} history:`, error)
        }
      }

      console.log(`Successfully stored ${ratesToStore.length} yield rates`)

      return new Response(
        JSON.stringify(ratesToStore),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (apiError) {
      console.error('BACEN API error, returning cached data:', apiError)
      
      // Return cached data if API fails
      const latestRates = []
      const rateTypes = ['selic', 'cdi', 'ipca']
      
      for (const rateType of rateTypes) {
        const rate = dbRates?.find(r => r.rate_type === rateType)
        if (rate) latestRates.push(rate)
      }
      
      return new Response(
        JSON.stringify(latestRates),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
  } catch (error) {
    console.error('General error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
