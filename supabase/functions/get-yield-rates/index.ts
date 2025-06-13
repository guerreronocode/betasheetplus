
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

    // Fetch from database first
    const { data: dbRates, error: dbError } = await supabaseClient
      .from('yield_rates')
      .select('*')
      .order('last_update', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // If we have recent data (less than 24 hours old), return it
    if (dbRates && dbRates.length > 0) {
      const lastUpdate = new Date(dbRates[0].last_update)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceUpdate < 24) {
        return new Response(
          JSON.stringify(dbRates.map(rate => ({
            id: rate.id,
            rate_type: rate.rate_type,
            rate_value: rate.rate_value,
            reference_date: rate.reference_date,
            last_update: rate.last_update
          }))),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Fetch fresh data from BACEN API and store historical data
    try {
      // Get historical SELIC data (last 30 days)
      const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/30?formato=json')
      const selicData = await selicResponse.json()
      
      // Get historical CDI data (last 30 days)
      const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/30?formato=json')
      const cdiData = await cdiResponse.json()
      
      // Get historical IPCA data (last 24 months for rolling 12-month calculation)
      const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/24?formato=json')
      const ipcaData = await ipcaResponse.json()

      // Store historical SELIC data
      for (const entry of selicData) {
        if (entry.data && entry.valor) {
          const date = entry.data.split('/').reverse().join('-') // Convert DD/MM/YYYY to YYYY-MM-DD
          await supabaseClient
            .from('yield_rates')
            .upsert({
              rate_type: 'selic',
              rate_value: parseFloat(entry.valor),
              reference_date: date,
              periodicity: 'daily'
            }, {
              onConflict: 'rate_type,reference_date'
            })
        }
      }

      // Store historical CDI data
      for (const entry of cdiData) {
        if (entry.data && entry.valor) {
          const date = entry.data.split('/').reverse().join('-')
          await supabaseClient
            .from('yield_rates')
            .upsert({
              rate_type: 'cdi',
              rate_value: parseFloat(entry.valor),
              reference_date: date,
              periodicity: 'daily'
            }, {
              onConflict: 'rate_type,reference_date'
            })
        }
      }

      // Store historical IPCA data and calculate rolling 12-month periods
      for (let i = 11; i < ipcaData.length; i++) {
        const currentEntry = ipcaData[i]
        if (currentEntry.data && currentEntry.valor) {
          const date = `${currentEntry.data.split('/')[2]}-${currentEntry.data.split('/')[1]}-01`
          
          // Calculate 12-month accumulated IPCA
          const last12Months = ipcaData.slice(i - 11, i + 1)
          const accumulated12Month = last12Months.reduce((acc, month) => {
            const monthlyRate = parseFloat(month.valor) / 100
            return acc * (1 + monthlyRate)
          }, 1) - 1
          
          await supabaseClient
            .from('yield_rates')
            .upsert({
              rate_type: 'ipca',
              rate_value: accumulated12Month * 100,
              reference_date: date,
              periodicity: 'monthly'
            }, {
              onConflict: 'rate_type,reference_date'
            })
        }
      }

      // Get latest rates for response
      const { data: updatedRates } = await supabaseClient
        .from('yield_rates')
        .select('*')
        .order('reference_date', { ascending: false })
        .limit(100)

      return new Response(
        JSON.stringify(updatedRates || []),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (apiError) {
      console.error('API error, returning cached data:', apiError)
      
      // Return cached data if API fails
      return new Response(
        JSON.stringify(dbRates || []),
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
