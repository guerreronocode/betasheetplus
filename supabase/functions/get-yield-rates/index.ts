
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

    // Check for recent data with improved cache logic
    const { data: dbRates, error: dbError } = await supabaseClient
      .from('yield_rates')
      .select('*')
      .order('reference_date', { ascending: false })
      .limit(10)

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Check if we have recent data (less than 12 hours old for yield rates)
    if (dbRates && dbRates.length > 0) {
      const lastUpdate = new Date(dbRates[0].last_update)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceUpdate < 12) {
        console.log('Returning cached yield rates data')
        // Return latest rates for each type
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

    console.log('Fetching fresh yield rates data with historical data...')

    // Fetch comprehensive historical data from BACEN API
    try {
      // Get SELIC historical data (last 90 days for better trend analysis)
      const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/90?formato=json')
      const selicData = await selicResponse.json()
      
      // Get CDI historical data (last 90 days)
      const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/90?formato=json')
      const cdiData = await cdiResponse.json()
      
      // Get IPCA historical data (last 36 months for rolling 12-month calculation)
      const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/36?formato=json')
      const ipcaData = await ipcaResponse.json()

      console.log(`Fetched ${selicData.length} SELIC entries, ${cdiData.length} CDI entries, ${ipcaData.length} IPCA entries`)

      // Store comprehensive SELIC historical data
      for (const entry of selicData) {
        if (entry.data && entry.valor) {
          const dateParts = entry.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` // Convert DD/MM/YYYY to YYYY-MM-DD
          
          try {
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
          } catch (error) {
            console.error('Error storing SELIC data:', error)
          }
        }
      }

      // Store comprehensive CDI historical data
      for (const entry of cdiData) {
        if (entry.data && entry.valor) {
          const dateParts = entry.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          
          try {
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
          } catch (error) {
            console.error('Error storing CDI data:', error)
          }
        }
      }

      // Store IPCA data with proper 12-month accumulated calculation
      for (let i = 11; i < ipcaData.length; i++) {
        const currentEntry = ipcaData[i]
        if (currentEntry.data && currentEntry.valor) {
          const dateParts = currentEntry.data.split('/')
          const date = `${dateParts[2]}-${dateParts[1]}-01` // First day of month
          
          // Calculate 12-month accumulated IPCA
          const last12Months = ipcaData.slice(i - 11, i + 1)
          let accumulated12Month = 1
          
          for (const month of last12Months) {
            if (month.valor) {
              const monthlyRate = parseFloat(month.valor) / 100
              accumulated12Month *= (1 + monthlyRate)
            }
          }
          
          const annual12MonthRate = (accumulated12Month - 1) * 100
          
          try {
            await supabaseClient
              .from('yield_rates')
              .upsert({
                rate_type: 'ipca',
                rate_value: annual12MonthRate,
                reference_date: date,
                periodicity: 'monthly'
              }, {
                onConflict: 'rate_type,reference_date'
              })
          } catch (error) {
            console.error('Error storing IPCA data:', error)
          }
        }
      }

      // Also store historical data in yield_rates_history for trend analysis
      const currentDate = new Date().toISOString().split('T')[0]
      
      // Store latest values in history table
      if (selicData.length > 0) {
        const latestSelic = selicData[selicData.length - 1]
        await supabaseClient
          .from('yield_rates_history')
          .upsert({
            rate_type: 'selic',
            rate_value: parseFloat(latestSelic.valor),
            reference_date: currentDate
          }, {
            onConflict: 'rate_type,reference_date'
          })
      }

      if (cdiData.length > 0) {
        const latestCdi = cdiData[cdiData.length - 1]
        await supabaseClient
          .from('yield_rates_history')
          .upsert({
            rate_type: 'cdi',
            rate_value: parseFloat(latestCdi.valor),
            reference_date: currentDate
          }, {
            onConflict: 'rate_type,reference_date'
          })
      }

      if (ipcaData.length >= 12) {
        // Calculate current 12-month IPCA
        const last12Months = ipcaData.slice(-12)
        let accumulated = 1
        for (const month of last12Months) {
          if (month.valor) {
            accumulated *= (1 + parseFloat(month.valor) / 100)
          }
        }
        const annualRate = (accumulated - 1) * 100
        
        await supabaseClient
          .from('yield_rates_history')
          .upsert({
            rate_type: 'ipca',
            rate_value: annualRate,
            reference_date: currentDate
          }, {
            onConflict: 'rate_type,reference_date'
          })
      }

      console.log('Successfully stored comprehensive historical yield rates data')

      // Get latest rates for response
      const { data: updatedRates } = await supabaseClient
        .from('yield_rates')
        .select('*')
        .order('reference_date', { ascending: false })

      // Return only the latest rate for each type
      const latestRates = []
      const rateTypes = ['selic', 'cdi', 'ipca']
      
      for (const rateType of rateTypes) {
        const rates = updatedRates?.filter(r => r.rate_type === rateType) || []
        if (rates.length > 0) {
          latestRates.push(rates[0])
        }
      }

      console.log(`Returning ${latestRates.length} latest yield rates`)

      return new Response(
        JSON.stringify(latestRates),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (apiError) {
      console.error('API error, returning cached data:', apiError)
      
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
