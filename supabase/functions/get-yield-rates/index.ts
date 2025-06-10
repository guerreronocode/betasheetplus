
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
      .from('interest_rates')
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
            reference_date: rate.reference_date
          }))),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Fetch fresh data from BACEN API
    try {
      const [selicResponse, cdiResponse, ipcaResponse] = await Promise.all([
        fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'),
        fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json'),
        fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
      ])

      const [selicData, cdiData, ipcaData] = await Promise.all([
        selicResponse.json(),
        cdiResponse.json(),
        ipcaResponse.json()
      ])

      // Calculate IPCA annual rate from last 12 months
      const ipcaAnnual = ipcaData.reduce((acc: number, month: any) => acc + parseFloat(month.valor), 0)

      const rates = [
        { rate_type: 'selic', rate_value: parseFloat(selicData[0].valor) },
        { rate_type: 'cdi', rate_value: parseFloat(cdiData[0].valor) },
        { rate_type: 'ipca', rate_value: ipcaAnnual }
      ]

      // Update database with fresh data
      for (const rate of rates) {
        await supabaseClient
          .from('interest_rates')
          .upsert({
            rate_type: rate.rate_type,
            rate_value: rate.rate_value,
            reference_date: new Date().toISOString().split('T')[0],
            last_update: new Date().toISOString()
          }, {
            onConflict: 'rate_type'
          })
      }

      return new Response(
        JSON.stringify(rates.map(rate => ({
          id: rate.rate_type,
          rate_type: rate.rate_type,
          rate_value: rate.rate_value,
          reference_date: new Date().toISOString().split('T')[0]
        }))),
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
