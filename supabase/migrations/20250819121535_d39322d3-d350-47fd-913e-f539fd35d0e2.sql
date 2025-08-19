-- Security hardening: Add search path protection to database functions
-- This prevents privilege escalation attacks through malicious schema manipulation

-- Update all security-sensitive functions to include search path protection
CREATE OR REPLACE FUNCTION public.process_bill_payment(p_bill_id uuid, p_payment_amount numeric, p_payment_account_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  bill_total NUMERIC;
  current_paid NUMERIC;
  bill_record RECORD;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO bill_record
  FROM public.credit_card_bills
  WHERE id = p_bill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fatura não encontrada';
  END IF;
  
  -- Calcular novo valor pago
  current_paid := COALESCE(bill_record.paid_amount, 0) + p_payment_amount;
  bill_total := bill_record.total_amount;
  
  -- Atualizar fatura
  UPDATE public.credit_card_bills
  SET 
    paid_amount = current_paid,
    is_paid = (current_paid >= bill_total AND bill_total > 0),
    payment_account_id = COALESCE(p_payment_account_id, payment_account_id),
    paid_at = CASE 
      WHEN (current_paid >= bill_total AND bill_total > 0) AND is_paid = false 
      THEN now() 
      ELSE paid_at 
    END,
    updated_at = now()
  WHERE id = p_bill_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_bill_as_paid(p_bill_id uuid, p_payment_account_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  bill_record RECORD;
  remaining_amount NUMERIC;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO bill_record
  FROM public.credit_card_bills
  WHERE id = p_bill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fatura não encontrada';
  END IF;
  
  -- Calcular valor restante a ser pago
  remaining_amount := bill_record.total_amount - COALESCE(bill_record.paid_amount, 0);
  
  -- Se já está totalmente paga, não fazer nada
  IF remaining_amount <= 0 THEN
    RETURN true;
  END IF;
  
  -- Marcar como totalmente paga
  UPDATE public.credit_card_bills
  SET 
    paid_amount = total_amount,
    is_paid = true,
    payment_account_id = COALESCE(p_payment_account_id, payment_account_id),
    paid_at = COALESCE(paid_at, now()),
    updated_at = now()
  WHERE id = p_bill_id;
  
  -- Debitar apenas o valor restante da conta bancária
  IF p_payment_account_id IS NOT NULL AND remaining_amount > 0 THEN
    UPDATE public.bank_accounts
    SET 
      balance = balance - remaining_amount,
      updated_at = now()
    WHERE id = p_payment_account_id;
  END IF;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_achievement(p_user_id uuid, p_achievement_id text, p_points integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  achievement_exists BOOLEAN;
BEGIN
  -- Check if user already has this achievement
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO achievement_exists;
  
  -- If they don't have it, award it
  IF NOT achievement_exists THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, points_earned)
    VALUES (p_user_id, p_achievement_id, p_points);
    
    -- Update user stats
    UPDATE public.user_stats 
    SET total_points = total_points + p_points,
        level = GREATEST(1, (total_points + p_points) / 100),
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Add RLS policies to secure public financial data
ALTER TABLE public.yield_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_rates_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for yield_rates (authenticated users only)
CREATE POLICY "Authenticated users can view yield rates" ON public.yield_rates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create policies for yield_rates_history (authenticated users only)
CREATE POLICY "Authenticated users can view yield rates history" ON public.yield_rates_history
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create policies for asset_prices (authenticated users only)
CREATE POLICY "Authenticated users can view asset prices" ON public.asset_prices
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add input validation constraints
ALTER TABLE public.expenses 
ADD CONSTRAINT check_expense_amount_positive CHECK (amount > 0),
ADD CONSTRAINT check_expense_amount_reasonable CHECK (amount <= 999999999.99);

ALTER TABLE public.income 
ADD CONSTRAINT check_income_amount_positive CHECK (amount > 0),
ADD CONSTRAINT check_income_amount_reasonable CHECK (amount <= 999999999.99);

ALTER TABLE public.investments 
ADD CONSTRAINT check_investment_amount_positive CHECK (amount > 0),
ADD CONSTRAINT check_investment_amount_reasonable CHECK (amount <= 999999999.99);

ALTER TABLE public.bank_accounts 
ADD CONSTRAINT check_balance_reasonable CHECK (balance >= -999999999.99 AND balance <= 999999999.99);