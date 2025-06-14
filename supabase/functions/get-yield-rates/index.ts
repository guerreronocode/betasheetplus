
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

    console.log('Fetching current yield rates data from BACEN API...')

    const ratesToStore = []
    const today = new Date().toISOString().split('T')[0]

    try {
      // SELIC - Taxa básica de juros (série 432) - último valor disponível
      const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
      const selicData = await selicResponse.json()
      
      // CDI - Certificados de Depósito Interbancário (série 12) - último valor disponível
      const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json')
      const cdiData = await cdiResponse.json()
      
      // IPCA - Índice de preços (série 433) - últimos 12 meses para calcular acumulado anual
      const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
      const ipcaData = await ipcaResponse.json()

      console.log(`Fetched SELIC: ${selicData?.length || 0} entries, CDI: ${cdiData?.length || 0} entries, IPCA: ${ipcaData?.length || 0} entries`)

      // Process SELIC data
      if (selicData && Array.isArray(selicData) && selicData.length > 0) {
        const latestSelic = selicData[selicData.length - 1]
        if (latestSelic.data && latestSelic.valor) {
          ratesToStore.push({
            rate_type: 'selic',
            rate_value: parseFloat(latestSelic.valor),
            reference_date: today, // Use today's date for current rates
            periodicity: 'daily'
          })
        }
      }

      // Process CDI data
      if (cdiData && Array.isArray(cdiData) && cdiData.length > 0) {
        const latestCdi = cdiData[cdiData.length - 1]
        if (latestCdi.data && latestCdi.valor) {
          ratesToStore.push({
            rate_type: 'cdi',
            rate_value: parseFloat(latestCdi.valor),
            reference_date: today, // Use today's date for current rates
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
        
        ratesToStore.push({
          rate_type: 'ipca',
          rate_value: annualRate,
          reference_date: today, // Use today's date for current rates
          periodicity: 'monthly'
        })
      }

      // Clear old data and store fresh rates with today's date
      for (const rate of ratesToStore) {
        try {
          // Delete old entries for this rate type
          await supabaseClient
            .from('yield_rates')
            .delete()
            .eq('rate_type', rate.rate_type)

          // Insert fresh data
          await supabaseClient
            .from('yield_rates')
            .insert(rate)
        } catch (error) {
          console.error(`Error storing ${rate.rate_type} data:`, error)
        }
      }

      // Store in history table for trend analysis
      for (const rate of ratesToStore) {
        try {
          await supabaseClient
            .from('yield_rates_history')
            .upsert({
              rate_type: rate.rate_type,
              rate_value: rate.rate_value,
              reference_date: today
            }, {
              onConflict: 'rate_type,reference_date'
            })
        } catch (error) {
          console.error(`Error storing ${rate.rate_type} history:`, error)
        }
      }

      console.log(`Successfully stored ${ratesToStore.length} current yield rates for ${today}`)

      return new Response(
        JSON.stringify(ratesToStore),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (apiError) {
      console.error('BACEN API error:', apiError)
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current rates from BACEN API' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
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
