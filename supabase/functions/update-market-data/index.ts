
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

    // Update yield rates from BACEN
    const bacenRates = await updateBacenRates(supabaseClient)
    
    // Update stock prices from Brapi
    const stockPrices = await updateStockPrices(supabaseClient)
    
    // Update currency rates from AwesomeAPI
    const currencyRates = await updateCurrencyRates(supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        updated: {
          bacenRates,
          stockPrices,
          currencyRates
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

async function updateBacenRates(supabaseClient: any) {
  try {
    // SELIC rate - Series 432
    const selicResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json')
    const selicData = await selicResponse.json()
    
    // CDI rate - Series 12
    const cdiResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json')
    const cdiData = await cdiResponse.json()
    
    // IPCA rate - Series 433
    const ipcaResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json')
    const ipcaData = await ipcaResponse.json()
    
    // Calculate IPCA annual rate from last 12 months
    const ipcaAnnual = ipcaData.reduce((acc: number, month: any) => acc + parseFloat(month.valor), 0)

    const rates = [
      { rate_type: 'selic', rate_value: parseFloat(selicData[0].valor) },
      { rate_type: 'cdi', rate_value: parseFloat(cdiData[0].valor) },
      { rate_type: 'ipca', rate_value: ipcaAnnual }
    ]

    for (const rate of rates) {
      await supabaseClient
        .from('yield_rates')
        .upsert({
          rate_type: rate.rate_type,
          rate_value: rate.rate_value,
          reference_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'rate_type,reference_date'
        })
    }

    return rates.length
  } catch (error) {
    console.error('Error updating BACEN rates:', error)
    return 0
  }
}

async function updateStockPrices(supabaseClient: any) {
  try {
    const symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'RENT3', 'MGLU3']
    let updatedCount = 0

    for (const symbol of symbols) {
      try {
        const response = await fetch(`https://brapi.dev/api/quote/${symbol}`)
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const stock = data.results[0]
          
          await supabaseClient
            .from('asset_prices')
            .upsert({
              symbol: stock.symbol,
              market_type: 'stock',
              price: stock.regularMarketPrice,
              change_percent: stock.regularMarketChangePercent || 0,
              quote_currency: stock.currency || 'BRL',
              source: 'brapi',
              exchange: 'B3',
              update_date: new Date().toISOString().split('T')[0]
            }, {
              onConflict: 'symbol,update_date'
            })
          
          updatedCount++
        }
      } catch (error) {
        console.error(`Error updating ${symbol}:`, error)
      }
    }

    return updatedCount
  } catch (error) {
    console.error('Error updating stock prices:', error)
    return 0
  }
}

async function updateCurrencyRates(supabaseClient: any) {
  try {
    const currencies = ['USD-BRL', 'EUR-BRL', 'BTC-BRL']
    let updatedCount = 0

    for (const currency of currencies) {
      try {
        const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}`)
        const data = await response.json()
        
        const key = currency.replace('-', '')
        if (data[key]) {
          const rate = data[key]
          const [base, quote] = currency.split('-')
          
          await supabaseClient
            .from('asset_prices')
            .upsert({
              symbol: currency,
              market_type: 'currency',
              price: parseFloat(rate.bid),
              change_percent: parseFloat(rate.pctChange) || 0,
              base_currency: base,
              quote_currency: quote,
              source: 'awesomeapi',
              exchange: null,
              update_date: new Date().toISOString().split('T')[0]
            }, {
              onConflict: 'symbol,update_date'
            })
          
          updatedCount++
        }
      } catch (error) {
        console.error(`Error updating ${currency}:`, error)
      }
    }

    return updatedCount
  } catch (error) {
    console.error('Error updating currency rates:', error)
    return 0
  }
}
