
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
    const { data: dbPrices, error: dbError } = await supabaseClient
      .from('market_data')
      .select('*')
      .order('last_update', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // If we have recent data (less than 1 hour old), return it
    if (dbPrices && dbPrices.length > 0) {
      const lastUpdate = new Date(dbPrices[0].last_update)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceUpdate < 1) {
        return new Response(
          JSON.stringify(dbPrices.map(price => ({
            id: price.id,
            symbol: price.symbol,
            price: price.current_price,
            currency: 'BRL',
            last_update: price.last_update,
            source: price.data_source
          }))),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Fetch fresh data from APIs
    const symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3']
    const currencies = ['USD-BRL', 'EUR-BRL']
    const updatedPrices = []

    try {
      // Fetch stock prices from brapi.dev
      for (const symbol of symbols) {
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${symbol}`)
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            const stock = data.results[0]
            
            const priceData = {
              symbol: stock.symbol,
              name: stock.longName || stock.symbol,
              current_price: stock.regularMarketPrice,
              change_percent: stock.regularMarketChangePercent,
              market_cap: stock.marketCap,
              volume: stock.regularMarketVolume,
              last_update: new Date().toISOString(),
              data_source: 'brapi'
            }

            await supabaseClient
              .from('market_data')
              .upsert(priceData, { onConflict: 'symbol' })

            updatedPrices.push({
              id: stock.symbol,
              symbol: stock.symbol,
              price: stock.regularMarketPrice,
              currency: 'BRL',
              last_update: new Date().toISOString(),
              source: 'brapi'
            })
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
        }
      }

      // Fetch currency rates from AwesomeAPI
      for (const currency of currencies) {
        try {
          const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}`)
          const data = await response.json()
          
          const key = currency.replace('-', '')
          if (data[key]) {
            const rate = data[key]
            
            const priceData = {
              symbol: currency,
              name: `${currency} Rate`,
              current_price: parseFloat(rate.bid),
              change_percent: parseFloat(rate.pctChange),
              last_update: new Date().toISOString(),
              data_source: 'awesomeapi'
            }

            await supabaseClient
              .from('market_data')
              .upsert(priceData, { onConflict: 'symbol' })

            updatedPrices.push({
              id: currency,
              symbol: currency,
              price: parseFloat(rate.bid),
              currency: 'BRL',
              last_update: new Date().toISOString(),
              source: 'awesomeapi'
            })
          }
        } catch (error) {
          console.error(`Error fetching ${currency}:`, error)
        }
      }

      return new Response(
        JSON.stringify(updatedPrices),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (apiError) {
      console.error('API error, returning cached data:', apiError)
      
      // Return cached data if API fails
      return new Response(
        JSON.stringify(dbPrices || []),
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
