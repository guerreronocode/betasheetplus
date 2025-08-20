-- Fix RLS policies for public tables that should require authentication

-- Update market_data RLS policy to require authentication
DROP POLICY IF EXISTS "Anyone can view market data" ON public.market_data;
CREATE POLICY "Authenticated users can view market data" 
ON public.market_data 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update interest_rates RLS policy to require authentication  
DROP POLICY IF EXISTS "Anyone can view interest rates" ON public.interest_rates;
CREATE POLICY "Authenticated users can view interest rates"
ON public.interest_rates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Update achievement_definitions RLS policy to require authentication
DROP POLICY IF EXISTS "Anyone can view achievement definitions" ON public.achievement_definitions;
CREATE POLICY "Authenticated users can view achievement definitions"
ON public.achievement_definitions  
FOR SELECT
USING (auth.uid() IS NOT NULL);