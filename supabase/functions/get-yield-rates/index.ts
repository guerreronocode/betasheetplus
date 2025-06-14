
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
      // SELIC - Taxa básica de juros (série 432) - valor anual
      console.log('Fetching SELIC data...')
      const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
      const selicData = await selicResponse.json()
      console.log('SELIC response:', selicData)
      
      // CDI - Taxa DI (série 12) - valor diário que precisa ser anualizado
      console.log('Fetching CDI data...')
      const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json')
      const cdiData = await cdiResponse.json()
      console.log('CDI response:', cdiData)
      
      // IPCA - Índice de preços (série 433) - últimos 12 meses para calcular acumulado anual
      console.log('Fetching IPCA data...')
      const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
      const ipcaData = await ipcaResponse.json()
      console.log('IPCA response length:', ipcaData?.length)

      // Process SELIC data - já vem em formato anual
      if (selicData && Array.isArray(selicData) && selicData.length > 0) {
        const latestSelic = selicData[selicData.length - 1]
        if (latestSelic.data && latestSelic.valor) {
          const selicValue = parseFloat(latestSelic.valor)
          console.log('SELIC value processed:', selicValue)
          ratesToStore.push({
            rate_type: 'selic',
            rate_value: selicValue, // SELIC já vem como taxa anual
            reference_date: today,
            periodicity: 'daily'
          })
        }
      }

      // Process CDI data - precisa converter de diário para anual
      if (cdiData && Array.isArray(cdiData) && cdiData.length > 0) {
        const latestCdi = cdiData[cdiData.length - 1]
        if (latestCdi.data && latestCdi.valor) {
          const dailyRate = parseFloat(latestCdi.valor)
          // Converter taxa diária para anual: ((1 + taxa/100)^252 - 1) * 100
          const annualRate = (Math.pow(1 + (dailyRate / 100), 252) - 1) * 100
          console.log('CDI daily rate:', dailyRate, 'Annual rate:', annualRate)
          ratesToStore.push({
            rate_type: 'cdi',
            rate_value: annualRate,
            reference_date: today,
            periodicity: 'daily'
          })
        }
      }

      // Process IPCA data - calcular acumulado dos últimos 12 meses
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
        console.log('IPCA 12-month accumulated rate:', annualRate)
        
        ratesToStore.push({
          rate_type: 'ipca',
          rate_value: annualRate,
          reference_date: today,
          periodicity: 'monthly'
        })
      }

      console.log('Rates to store:', ratesToStore)

      // Clear old data and store fresh rates with today's date
      for (const rate of ratesToStore) {
        try {
          // Delete old entries for this rate type
          await supabaseClient
            .from('yield_rates')
            .delete()
            .eq('rate_type', rate.rate_type)

          // Insert fresh data
          const { error } = await supabaseClient
            .from('yield_rates')
            .insert(rate)
            
          if (error) {
            console.error(`Error inserting ${rate.rate_type}:`, error)
          } else {
            console.log(`Successfully inserted ${rate.rate_type} with value ${rate.rate_value}`)
          }
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
