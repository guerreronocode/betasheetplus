
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

    const brapiToken = Deno.env.get('BRAPI_TOKEN')
    const today = new Date().toISOString().split('T')[0]

    console.log('Fetching fresh market data for', today)

    // Clear existing data for today to avoid duplicates
    await supabaseClient
      .from('asset_prices')
      .delete()
      .eq('update_date', today)

    const freshPrices = []

    try {
      // Top Brazilian stocks by market cap
      const topStocks = [
        'ITUB4', 'BBDC4', 'VALE3', 'PETR4', 'ABEV3', 'BBAS3', 'WEGE3', 'RENT3', 'B3SA3',
        'SANB11', 'MGLU3', 'ELET3', 'RADL3', 'RAIL3', 'LREN3', 'JBSS3', 'SUZB3', 'CCRO3',
        'CPLE6', 'CMIG4', 'GGBR4', 'USIM5', 'SBSP3', 'TAEE11', 'CSAN3', 'BRF3', 'ARZZ3',
        'KLBN11', 'GOAU4', 'CSNA3', 'VIVT3', 'TOTS3', 'ELET6', 'CPFE3', 'FLRY3', 'RDOR3'
      ]

      console.log(`Fetching data for ${topStocks.length} top stocks...`)

      // Fetch in batches to respect rate limits
      const batchSize = 10
      for (let i = 0; i < topStocks.length; i += batchSize) {
        const batch = topStocks.slice(i, i + batchSize).join(',')
        
        try {
          const requestHeaders = {
            'User-Agent': 'FinanceApp/1.0',
            'Authorization': `Bearer ${brapiToken}`
          }

          const response = await fetch(`https://brapi.dev/api/quote/${batch}`, {
            headers: requestHeaders
          })
          
          if (!response.ok) {
            console.error(`BRAPI API error: ${response.status} ${response.statusText}`)
            continue
          }
          
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
                  update_date: today
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching batch ${i}-${i + batchSize}:`, error)
        }
        
        // Add delay between batches
        if (i + batchSize < topStocks.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log(`Successfully fetched ${freshPrices.filter(p => p.market_type === 'stock').length} stock prices`)
    } catch (error) {
      console.error('Error fetching stock data:', error)
    }

    // Fetch currency rates
    const currencies = ['USD-BRL', 'EUR-BRL', 'BTC-BRL', 'ETH-BRL']
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
            update_date: today
          })
        }
      } catch (error) {
        console.error(`Error fetching ${currency}:`, error)
      }
    }

    // Insert fresh data
    if (freshPrices.length > 0) {
      console.log(`Inserting ${freshPrices.length} fresh prices`)
      
      const { error: insertError } = await supabaseClient
        .from('asset_prices')
        .insert(freshPrices)

      if (insertError) {
        console.error('Error inserting prices:', insertError)
      }
    }

    // Get final data
    const { data: finalPrices } = await supabaseClient
      .from('asset_prices')
      .select('*')
      .eq('update_date', today)
      .order('price', { ascending: false })

    console.log(`Returning ${finalPrices?.length || 0} asset prices for ${today}`)

    return new Response(
      JSON.stringify(finalPrices || []),
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
