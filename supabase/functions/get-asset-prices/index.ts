
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

    // Fetch from database first with improved cache logic
    const { data: dbPrices, error: dbError } = await supabaseClient
      .from('asset_prices')
      .select('*')
      .order('last_update', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Check cache freshness - stocks: 1 hour, currencies: 4 hours
    const now = Date.now()
    let hasRecentStocks = false
    let hasRecentCurrencies = false

    if (dbPrices && dbPrices.length > 0) {
      const stockPrices = dbPrices.filter(p => p.market_type === 'stock')
      const currencyPrices = dbPrices.filter(p => p.market_type === 'currency')
      
      if (stockPrices.length > 0) {
        const lastStockUpdate = new Date(stockPrices[0].last_update).getTime()
        hasRecentStocks = (now - lastStockUpdate) < (1 * 60 * 60 * 1000) // 1 hour
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

    // Fetch fresh data
    const freshPrices = []
    console.log('Fetching fresh market data...')

    // Get comprehensive list of Brazilian stocks - hundreds of them
    if (!hasRecentStocks) {
      try {
        // Top 200+ most liquid Brazilian stocks
        const allSymbols = [
          // Major banks
          'ITUB4', 'BBDC4', 'BBAS3', 'SANB11', 'BPAC11',
          // Oil & Energy
          'PETR4', 'PETR3', 'VALE3', 'ELET3', 'ELET6', 'CPLE6', 'CMIG4', 'CPFE3', 'EGIE3', 'TAEE11', 'SBSP3',
          // Technology & E-commerce
          'MGLU3', 'LWSA3', 'MELI34', 'SOMA3', 'NTCO3', 'STBP3',
          // Consumer goods
          'ABEV3', 'JBSS3', 'BRF3', 'SMTO3', 'HYPE3', 'CRFB3', 'PCAR3', 'ASAI3', 'CAML3',
          // Real Estate
          'RENT3', 'GFSA3', 'CYRE3', 'EVEN3', 'MRFG3', 'MDNE3', 'EZTC3', 'JHSF3', 'TCSA3',
          // Industrial
          'WEGE3', 'RAIL3', 'CCRO3', 'ECOR3', 'SUZB3', 'GOAU4', 'USIM5', 'CSNA3', 'GGBR4', 'KLBN11',
          // Healthcare & Pharma
          'RDOR3', 'HAPV3', 'QUAL3', 'FLRY3', 'DASA3', 'GNDI3', 'PLAN3', 'AALR3', 'MATD3',
          // Retail
          'LREN3', 'ARZZ3', 'GMAT3', 'VIVA3', 'GUAR3', 'ALPA4', 'LAME4', 'RADL3', 'RAIA3', 'PNVL3',
          // Telecom & Media
          'VIVT3', 'TOTS3', 'TIMS3', 'DESK3',
          // Agribusiness
          'SLCE3', 'TTEN3', 'RAIZ4', 'SOJA3', 'AGRO3',
          // Logistics
          'LOGN3', 'SIMH3', 'STBP3',
          // Paper & Pulp
          'SUZB3', 'KLBN11', 'FIBR3',
          // Steel & Mining
          'CSNA3', 'GGBR4', 'USIM5', 'GOAU4', 'VALE3',
          // Airlines
          'AZUL4', 'GOLL4', 'CMIN3',
          // Insurance
          'BBSE3', 'SULA11', 'IRBR3', 'PSSA3',
          // Financial Services
          'B3SA3', 'BPAN4', 'PINE4', 'MULT3',
          // Construction & Engineering
          'MRVE3', 'TEND3', 'DIRR3', 'HBOR3',
          // Education
          'COGN3', 'YDUQ3', 'SULA11',
          // Water & Sanitation
          'SAPR11', 'CSMG3',
          // Additional stocks
          'CSAN3', 'UGPA3', 'BEEF3', 'MRFG3', 'IFCM3', 'IRBR3', 'ODPV3', 'BMGB4', 'BIDI11',
          'ANIM3', 'CBAV3', 'CEAB3', 'DEXP3', 'ESPA3', 'FESA4', 'GSHP3', 'HBRE3', 'JALL3',
          'LAVV3', 'LOGG3', 'MILS3', 'ONCO3', 'PORT3', 'RECV3', 'SEQL3', 'TGMA3', 'VLID3'
        ]

        console.log(`Fetching data for ${allSymbols.length} stocks...`)

        // Fetch in batches to avoid rate limits
        const batchSize = 15
        for (let i = 0; i < allSymbols.length; i += batchSize) {
          const batch = allSymbols.slice(i, i + batchSize).join(',')
          
          try {
            const response = await fetch(`https://brapi.dev/api/quote/${batch}`)
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
          
          // Add delay between batches to respect rate limits
          if (i + batchSize < allSymbols.length) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }

        console.log(`Successfully fetched ${freshPrices.filter(p => p.market_type === 'stock').length} stock prices`)
      } catch (error) {
        console.error('Error fetching comprehensive stock list:', error)
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
    }

    // Update database with fresh data if we have any
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
