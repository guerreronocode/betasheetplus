
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

    // Get BRAPI token
    const brapiToken = Deno.env.get('BRAPI_TOKEN')
    
    // Check for recent data
    const { data: dbPrices, error: dbError } = await supabaseClient
      .from('asset_prices')
      .select('*')
      .order('last_update', { ascending: false })
      .limit(50)

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Check cache freshness - stocks: 2 hours, currencies: 4 hours
    const now = Date.now()
    let hasRecentStocks = false
    let hasRecentCurrencies = false

    if (dbPrices && dbPrices.length > 0) {
      const stockPrices = dbPrices.filter(p => p.market_type === 'stock')
      const currencyPrices = dbPrices.filter(p => p.market_type === 'currency')
      
      if (stockPrices.length > 0) {
        const lastStockUpdate = new Date(stockPrices[0].last_update).getTime()
        hasRecentStocks = (now - lastStockUpdate) < (2 * 60 * 60 * 1000) // 2 hours
      }
      
      if (currencyPrices.length > 0) {
        const lastCurrencyUpdate = new Date(currencyPrices[0].last_update).getTime()
        hasRecentCurrencies = (now - lastCurrencyUpdate) < (4 * 60 * 60 * 1000) // 4 hours
      }
    }

    // Return cached data if recent enough
    if (hasRecentStocks && hasRecentCurrencies) {
      console.log('Returning cached data - all assets are recent')
      return new Response(
        JSON.stringify(dbPrices),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const freshPrices = []
    console.log('Fetching fresh market data...')

    // Fetch stock data if not recent
    if (!hasRecentStocks) {
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
              'User-Agent': 'FinanceApp/1.0'
            }
            
            // Add authorization header if token is available
            if (brapiToken) {
              requestHeaders['Authorization'] = `Bearer ${brapiToken}`
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
                  // Check if this stock already exists for today
                  const today = new Date().toISOString().split('T')[0]
                  const existingStock = dbPrices?.find(p => 
                    p.symbol === stock.symbol && 
                    p.update_date === today &&
                    p.market_type === 'stock'
                  )
                  
                  if (!existingStock) {
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
    }

    // Fetch currency rates if not recent
    if (!hasRecentCurrencies) {
      const currencies = ['USD-BRL', 'EUR-BRL', 'BTC-BRL', 'ETH-BRL']
      for (const currency of currencies) {
        try {
          const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}`)
          const data = await response.json()
          
          const key = currency.replace('-', '')
          if (data[key]) {
            const rate = data[key]
            const [base, quote] = currency.split('-')
            const today = new Date().toISOString().split('T')[0]
            
            // Check if this currency already exists for today
            const existingCurrency = dbPrices?.find(p => 
              p.symbol === currency && 
              p.update_date === today &&
              p.market_type === 'currency'
            )
            
            if (!existingCurrency) {
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
          }
        } catch (error) {
          console.error(`Error fetching ${currency}:`, error)
        }
      }
    }

    // Update database with fresh data only if we have new data
    if (freshPrices.length > 0) {
      console.log(`Updating database with ${freshPrices.length} new prices`)
      for (const price of freshPrices) {
        try {
          await supabaseClient
            .from('asset_prices')
            .upsert(price, {
              onConflict: 'symbol,update_date'
            })
        } catch (error) {
          console.error('Error upserting price:', error)
        }
      }
    }

    // Get updated data from database
    const { data: updatedPrices } = await supabaseClient
      .from('asset_prices')
      .select('*')
      .order('last_update', { ascending: false })

    console.log(`Returning ${updatedPrices?.length || 0} total asset prices`)

    return new Response(
      JSON.stringify(updatedPrices || []),
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
