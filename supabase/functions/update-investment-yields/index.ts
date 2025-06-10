
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

    // First, get current yield rates from the database
    const { data: yieldRates, error: ratesError } = await supabaseClient
      .from('interest_rates')
      .select('*')

    if (ratesError) {
      console.error('Error fetching yield rates:', ratesError)
      throw ratesError
    }

    // Create a map for easy lookup
    const ratesMap = new Map()
    yieldRates.forEach(rate => {
      ratesMap.set(rate.rate_type, rate.rate_value)
    })

    // Get all investments that need yield updates
    const { data: investments, error: investmentsError } = await supabaseClient
      .from('investments')
      .select('*')
      .neq('yield_type', 'stocks') // Don't update stock investments automatically

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError)
      throw investmentsError
    }

    let updatedCount = 0

    // Update each investment
    for (const investment of investments) {
      let newCurrentValue = investment.amount
      let effectiveYieldRate = investment.yield_rate || 0

      // Get the current rate for variable yield types
      if (investment.yield_type !== 'fixed') {
        const currentRate = ratesMap.get(investment.yield_type)
        if (currentRate !== undefined) {
          effectiveYieldRate = currentRate
        }
      }

      // Calculate days since purchase
      const purchaseDate = new Date(investment.purchase_date)
      const today = new Date()
      const daysSincePurchase = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))

      // Calculate compound interest (daily compounding)
      if (daysSincePurchase > 0 && effectiveYieldRate > 0) {
        const dailyRate = effectiveYieldRate / 100 / 365
        newCurrentValue = investment.amount * Math.pow(1 + dailyRate, daysSincePurchase)
      }

      // Update the investment
      const { error: updateError } = await supabaseClient
        .from('investments')
        .update({
          current_value: newCurrentValue,
          yield_rate: effectiveYieldRate,
          last_yield_update: today.toISOString().split('T')[0]
        })
        .eq('id', investment.id)

      if (updateError) {
        console.error(`Error updating investment ${investment.id}:`, updateError)
      } else {
        updatedCount++
        console.log(`Updated investment ${investment.name}: ${investment.amount} -> ${newCurrentValue}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated yields for ${updatedCount} investments`,
        updatedAt: new Date().toISOString()
      }),
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
