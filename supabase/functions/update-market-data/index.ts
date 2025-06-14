
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

    console.log('Starting scheduled market data update...')

    // This function now just triggers the other functions
    // to avoid duplication and conflicts
    
    // Update yield rates
    console.log('Triggering yield rates update...')
    const yieldRatesResponse = await supabaseClient.functions.invoke('get-yield-rates')
    
    // Update asset prices  
    console.log('Triggering asset prices update...')
    const assetPricesResponse = await supabaseClient.functions.invoke('get-asset-prices')

    const result = {
      success: true,
      yieldRatesUpdated: !yieldRatesResponse.error,
      assetPricesUpdated: !assetPricesResponse.error,
      timestamp: new Date().toISOString()
    }

    if (yieldRatesResponse.error) {
      console.error('Yield rates update error:', yieldRatesResponse.error)
    }
    
    if (assetPricesResponse.error) {
      console.error('Asset prices update error:', assetPricesResponse.error)
    }

    console.log('Market data update completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Update market data error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
