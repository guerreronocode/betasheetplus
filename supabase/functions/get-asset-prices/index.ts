
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
      .from('asset_prices')
      .select('*')
      .order('last_update', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // If we have recent data (less than 4 hours old), return it
    if (dbPrices && dbPrices.length > 0) {
      const lastUpdate = new Date(dbPrices[0].last_update)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceUpdate < 4) {
        return new Response(
          JSON.stringify(dbPrices),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Fetch fresh data from APIs
    const freshPrices = []
    const brapiToken = Deno.env.get('BRAPI_TOKEN')

    // Get a comprehensive list of Brazilian stocks from Brapi
    try {
      const listResponse = await fetch(`https://brapi.dev/api/quote/list?token=${brapiToken}`)
      const listData = await listResponse.json()
      
      // Get the most liquid stocks (top 100)
      const symbols = listData.stocks?.slice(0, 100)?.map((stock: any) => stock.stock) || [
        'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'RENT3', 'MGLU3',
        'BBAS3', 'JBSS3', 'SUZB3', 'RAIL3', 'UGPA3', 'CSAN3', 'USIM5', 'CSNA3',
        'GOAU4', 'CCRO3', 'ECOR3', 'CPLE6', 'EGIE3', 'TAEE11', 'CMIG4', 'SBSP3',
        'VIVT3', 'TOTS3', 'QUAL3', 'HAPV3', 'PLAN3', 'FLRY3', 'RADL3', 'RAIA3',
        'PCAR3', 'ASAI3', 'CRFB3', 'NTCO3', 'LWSA3', 'SOMA3', 'LREN3', 'GMAT3'
      ]

      // Fetch in batches to avoid rate limits
      const batchSize = 20
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize).join(',')
        
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${batch}?token=${brapiToken}`)
          const data = await response.json()
          
          if (data.results && Array.isArray(data.results)) {
            for (const stock of data.results) {
              if (stock.regularMarketPrice && stock.symbol) {
                freshPrices.push({
                  symbol: stock.symbol,
                  market_type: 'stock',
                  price: stock.regularMarketPrice,
                  change_percent: stock.regularMarketChangePercent || 0,
                  quote_currency: stock.currency || 'BRL',
                  source: 'brapi',
                  exchange: 'B3',
                  update_date: new Date().toISOString().split('T')[0]
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching batch ${i}-${i + batchSize}:`, error)
        }
        
        // Add small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.error('Error fetching comprehensive stock list:', error)
      
      // Fallback to hardcoded list
      const fallbackSymbols = [
        'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'RENT3', 'MGLU3',
        'BBAS3', 'JBSS3', 'SUZB3', 'RAIL3', 'UGPA3', 'CSAN3', 'USIM5', 'CSNA3'
      ]
      
      for (const symbol of fallbackSymbols) {
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${symbol}?token=${brapiToken}`)
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            const stock = data.results[0]
            freshPrices.push({
              symbol: stock.symbol,
              market_type: 'stock',
              price: stock.regularMarketPrice,
              change_percent: stock.regularMarketChangePercent || 0,
              quote_currency: stock.currency || 'BRL',
              source: 'brapi',
              exchange: 'B3',
              update_date: new Date().toISOString().split('T')[0]
            })
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
        }
      }
    }

    // Fetch currency rates from AwesomeAPI
    const currencies = ['USD-BRL', 'EUR-BRL', 'BTC-BRL']
    for (const currency of currencies) {
      try {
        const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}`)
        const data = await response.json()
        
        const key = currency.replace('-', '')
        if (data[key]) {
          const rate = data[key]
          const [base, quote] = currency.split('-')
          
          freshPrices.push({
            symbol: currency,
            market_type: 'currency',
            price: parseFloat(rate.bid),
            change_percent: parseFloat(rate.pctChange) || 0,
            base_currency: base,
            quote_currency: quote,
            source: 'awesomeapi',
            exchange: null,
            update_date: new Date().toISOString().split('T')[0]
          })
        }
      } catch (error) {
        console.error(`Error fetching ${currency}:`, error)
      }
    }

    // Update database with fresh data
    if (freshPrices.length > 0) {
      for (const price of freshPrices) {
        await supabaseClient
          .from('asset_prices')
          .upsert(price, {
            onConflict: 'symbol,update_date'
          })
      }
    }

    console.log(`Updated ${freshPrices.length} asset prices`)

    // Return fresh data or cached data if API fails
    return new Response(
      JSON.stringify(freshPrices.length > 0 ? freshPrices : dbPrices || []),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
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
