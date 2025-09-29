-- Fix critical security issue with financial_evolution_data view
-- This view was exposing financial data without proper RLS

-- Drop the existing insecure view
DROP VIEW IF EXISTS public.financial_evolution_data;

-- Create a secure function to get financial evolution data
CREATE OR REPLACE FUNCTION public.get_user_financial_evolution(p_user_id uuid)
RETURNS TABLE (
  month_date timestamp with time zone,
  category text,
  type text,
  value numeric,
  total_assets numeric,
  total_liabilities numeric,
  net_worth numeric,
  liquid_reserves numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the requesting user matches the data owner
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to financial data';
  END IF;

  -- Return aggregated financial evolution data
  RETURN QUERY
  SELECT 
    DATE_TRUNC('month', CURRENT_DATE) as month_date,
    'total'::text as category,
    'snapshot'::text as type,
    0::numeric as value,
    COALESCE((SELECT SUM(current_value) FROM public.assets WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT SUM(current_value) FROM public.investments WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT SUM(balance) FROM public.bank_accounts WHERE user_id = p_user_id AND is_active = true), 0) as total_assets,
    COALESCE((SELECT SUM(remaining_amount) FROM public.liabilities WHERE user_id = p_user_id), 0) as total_liabilities,
    (COALESCE((SELECT SUM(current_value) FROM public.assets WHERE user_id = p_user_id), 0) +
     COALESCE((SELECT SUM(current_value) FROM public.investments WHERE user_id = p_user_id), 0) +
     COALESCE((SELECT SUM(balance) FROM public.bank_accounts WHERE user_id = p_user_id AND is_active = true), 0)) -
    COALESCE((SELECT SUM(remaining_amount) FROM public.liabilities WHERE user_id = p_user_id), 0) as net_worth,
    COALESCE((SELECT SUM(balance) FROM public.bank_accounts WHERE user_id = p_user_id AND is_active = true), 0) as liquid_reserves;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_financial_evolution(uuid) TO authenticated;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.get_user_financial_evolution IS 
'Securely returns financial evolution data for the authenticated user. Uses SECURITY DEFINER with explicit user_id verification to prevent unauthorized access.';