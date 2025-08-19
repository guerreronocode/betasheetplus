-- Final batch: Fix the last remaining database functions with search path protection

CREATE OR REPLACE FUNCTION public.calculate_objective_progress(p_user_id uuid, p_month date, p_objective_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  obj RECORD;
  val NUMERIC := 0;
  pct NUMERIC := 0;
  new_st TEXT;
  obj_type TEXT;
  monthly_income NUMERIC;
  monthly_investments NUMERIC;
  current_spending NUMERIC;
  previous_spending NUMERIC;
  target_category TEXT;
BEGIN
  -- Buscar dados do objetivo
  SELECT * INTO obj
    FROM public.monthly_objectives
   WHERE id = p_objective_id
     AND user_id = p_user_id;
     
  IF NOT FOUND THEN 
    RETURN; 
  END IF;

  -- Obter tipo do objetivo
  obj_type := obj.related_data->>'type';

  -- Calcular com base no tipo
  IF obj_type = 'save_amount' THEN
    -- Calcular economia do mês (receitas - despesas)
    SELECT 
      COALESCE(
        (SELECT COALESCE(SUM(amount), 0) 
         FROM public.income  
         WHERE user_id = p_user_id 
           AND date >= p_month 
           AND date < p_month + INTERVAL '1 month') -
        (SELECT COALESCE(SUM(amount), 0) 
         FROM public.expenses 
         WHERE user_id = p_user_id 
           AND date >= p_month 
           AND date < p_month + INTERVAL '1 month'),
        0
      ) INTO val;
      
  ELSIF obj_type = 'invest_percentage' THEN
    -- Calcular percentual investido da renda
    SELECT COALESCE(SUM(amount), 0) INTO monthly_investments
    FROM public.investments
    WHERE user_id = p_user_id 
      AND purchase_date >= p_month 
      AND purchase_date < p_month + INTERVAL '1 month';
      
    SELECT COALESCE(SUM(amount), 0) INTO monthly_income
    FROM public.income
    WHERE user_id = p_user_id 
      AND date >= p_month 
      AND date < p_month + INTERVAL '1 month';
      
    IF monthly_income > 0 THEN
      pct := (monthly_investments / monthly_income) * 100;
    END IF;
    
  ELSIF obj_type = 'reduce_category_spending' THEN
    -- Comparar gastos da categoria com mês anterior
    target_category := obj.related_data->>'category';
    
    SELECT COALESCE(SUM(amount), 0) INTO current_spending
    FROM public.expenses
    WHERE user_id = p_user_id 
      AND category = target_category
      AND date >= p_month 
      AND date < p_month + INTERVAL '1 month';
      
    SELECT COALESCE(SUM(amount), 0) INTO previous_spending
    FROM public.expenses
    WHERE user_id = p_user_id 
      AND category = target_category
      AND date >= p_month - INTERVAL '1 month'
      AND date < p_month;
      
    IF previous_spending > 0 THEN
      pct := GREATEST(0, ((previous_spending - current_spending) / previous_spending) * 100);
    END IF;
    
  ELSE
    -- Manter valores atuais para tipos não reconhecidos
    val := obj.current_value;
    pct := obj.current_percentage;
  END IF;

  -- Determinar novo status
  IF obj.calculation_type = 'value' THEN
    IF val >= obj.target_value THEN
      new_st := 'completed';
    ELSIF val > 0 THEN
      new_st := 'in_progress';
    ELSE
      new_st := 'not_started';
    END IF;
  ELSE
    IF pct >= obj.target_percentage THEN
      new_st := 'completed';
    ELSIF pct > 0 THEN
      new_st := 'in_progress';
    ELSE
      new_st := 'not_started';
    END IF;
  END IF;

  -- Atualizar objetivo
  UPDATE public.monthly_objectives
     SET current_value = val,
         current_percentage = pct,
         status = new_st,
         completed_at = CASE 
           WHEN new_st = 'completed' AND obj.status <> 'completed' 
           THEN now() 
           ELSE obj.completed_at 
         END,
         updated_at = now()
   WHERE id = p_objective_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_projected_credit_limit(p_credit_card_id uuid, p_months_ahead integer DEFAULT 12)
 RETURNS TABLE(month date, projected_available_limit numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  card_limit NUMERIC;
  current_month DATE;
  i INTEGER;
  month_usage NUMERIC;
BEGIN
  -- Buscar limite do cartão
  SELECT credit_limit INTO card_limit
  FROM public.credit_cards
  WHERE id = p_credit_card_id;
  
  -- Começar do mês atual
  current_month := DATE_TRUNC('month', CURRENT_DATE);
  
  FOR i IN 0..p_months_ahead-1 LOOP
    -- Calcular uso do mês
    SELECT COALESCE(SUM(amount), 0) INTO month_usage
    FROM public.credit_card_installments
    WHERE credit_card_id = p_credit_card_id
      AND bill_month = current_month + (i || ' months')::INTERVAL
      AND is_paid = false;
    
    RETURN QUERY SELECT 
      (current_month + (i || ' months')::INTERVAL)::DATE,
      (card_limit - month_usage);
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_credit_card_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  card_record RECORD;
  installment_amount NUMERIC;
  bill_closing_date DATE;
  bill_due_date DATE;
  bill_cycle_month DATE;
  safe_due_day INTEGER;
  safe_closing_day INTEGER;
  i INTEGER;
BEGIN
  -- Buscar dados do cartão
  SELECT closing_day, due_day INTO card_record
  FROM public.credit_cards
  WHERE id = NEW.credit_card_id;
  
  -- Validação: closing_day e due_day não podem ser iguais
  IF card_record.closing_day = card_record.due_day THEN
    RAISE WARNING 'Cartão ID % tem closing_day igual a due_day (%). Isso pode gerar inconsistências.', 
      NEW.credit_card_id, card_record.closing_day;
  END IF;
  
  -- Valor de cada parcela
  installment_amount := NEW.amount / NEW.installments;
  
  FOR i IN 1..NEW.installments LOOP
    DECLARE
      installment_date DATE := NEW.purchase_date + (i - 1) * INTERVAL '1 month';
    BEGIN
      -- Calcular a data de fechamento da fatura para esta parcela
      bill_closing_date := public.calculate_bill_month(installment_date, card_record.closing_day);
      
      -- O bill_cycle_month é o primeiro dia do mês da data de fechamento (identificador da fatura)
      bill_cycle_month := DATE_TRUNC('month', bill_closing_date);
      
      -- Calcular data de vencimento com proteção para meses menores
      safe_due_day := LEAST(
        card_record.due_day,
        EXTRACT(DAY FROM (bill_cycle_month + INTERVAL '2 months' - INTERVAL '1 day'))::INTEGER
      );
      
      bill_due_date := DATE_TRUNC('month', bill_closing_date + INTERVAL '1 month') + (safe_due_day - 1) * INTERVAL '1 day';
      
      -- Inserir parcela
      INSERT INTO public.credit_card_installments (
        user_id, purchase_id, credit_card_id,
        installment_number, amount, due_date, bill_month,
        created_at, updated_at
      ) VALUES (
        NEW.user_id, NEW.id, NEW.credit_card_id,
        i, installment_amount, bill_due_date, bill_cycle_month,
        now(), now()
      );
      
      -- Criar ou atualizar fatura
      INSERT INTO public.credit_card_bills (
        user_id, credit_card_id, bill_month,
        total_amount, closing_date, due_date,
        created_at, updated_at
      ) VALUES (
        NEW.user_id, NEW.credit_card_id, bill_cycle_month,
        installment_amount, bill_closing_date, bill_due_date,
        now(), now()
      )
      ON CONFLICT (credit_card_id, bill_month) DO UPDATE SET
        total_amount = public.credit_card_bills.total_amount + EXCLUDED.total_amount,
        updated_at = now();
    END;
  END LOOP;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_credit_card_debts()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Executar a sincronização em background para não afetar performance
  PERFORM public.sync_credit_card_debts_to_patrimony();
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_paid_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Se is_paid mudou para true e paid_at está nulo, definir paid_at
  IF NEW.is_paid = true AND OLD.is_paid = false AND NEW.paid_at IS NULL THEN
    NEW.paid_at = now();
  END IF;
  
  -- Se is_paid mudou para false, limpar paid_at
  IF NEW.is_paid = false AND OLD.is_paid = true THEN
    NEW.paid_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_investment_yields()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Atualizar rendimentos baseado na taxa e tempo
  UPDATE public.investments 
  SET current_value = amount * (1 + (yield_rate / 100) * EXTRACT(days FROM (CURRENT_DATE - purchase_date)) / 365),
      last_yield_update = CURRENT_DATE
  WHERE yield_type IN ('fixed', 'cdi', 'selic', 'ipca') 
    AND last_yield_update < CURRENT_DATE;
END;
$function$;