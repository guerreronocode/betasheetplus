-- Final security hardening: Fix all remaining database functions with search path protection

CREATE OR REPLACE FUNCTION public.update_bill_payment_status_on_installment_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  bill_total NUMERIC;
  installments_paid_amount NUMERIC;
BEGIN
  -- Calcular total de parcelas pagas desta fatura
  SELECT COALESCE(SUM(
    CASE 
      WHEN is_paid THEN amount 
      ELSE 0 
    END
  ), 0) INTO installments_paid_amount
  FROM public.credit_card_installments
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  -- Buscar total da fatura
  SELECT total_amount INTO bill_total
  FROM public.credit_card_bills
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  -- Atualizar status da fatura baseado no que foi pago das parcelas
  UPDATE public.credit_card_bills
  SET 
    paid_amount = GREATEST(COALESCE(paid_amount, 0), installments_paid_amount),
    is_paid = (installments_paid_amount >= bill_total AND bill_total > 0),
    updated_at = now()
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_credit_cards_patrimony(p_user_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  total_patrimony NUMERIC := 0;
  card_record RECORD;
  unpaid_installments NUMERIC;
BEGIN
  FOR card_record IN 
    SELECT id, credit_limit 
    FROM public.credit_cards 
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND include_in_patrimony = true
  LOOP
    -- Calcular parcelas futuras não pagas
    SELECT COALESCE(SUM(amount), 0) INTO unpaid_installments
    FROM public.credit_card_installments
    WHERE credit_card_id = card_record.id
      AND is_paid = false;
    
    -- Adicionar ao patrimônio: limite - parcelas futuras
    total_patrimony := total_patrimony + (card_record.credit_limit - unpaid_installments);
  END LOOP;
  
  RETURN total_patrimony;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_actual_spending(p_user_id uuid, p_period_start date, p_period_end date, p_category text DEFAULT NULL::text)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  actual_spending NUMERIC := 0;
  transactions_spending NUMERIC := 0;
  credit_card_spending NUMERIC := 0;
BEGIN
  -- Gastos em transações normais
  IF p_category IS NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO transactions_spending
    FROM public.expenses
    WHERE user_id = p_user_id
      AND date >= p_period_start
      AND date < p_period_end;
  ELSE
    SELECT COALESCE(SUM(amount), 0) INTO transactions_spending
    FROM public.expenses
    WHERE user_id = p_user_id
      AND date >= p_period_start
      AND date < p_period_end
      AND category = p_category;
  END IF;

  -- Gastos no cartão de crédito (por mês da fatura)
  IF p_category IS NULL THEN
    SELECT COALESCE(SUM(cci.amount), 0) INTO credit_card_spending
    FROM public.credit_card_installments cci
    JOIN public.credit_cards cc ON cci.credit_card_id = cc.id
    WHERE cci.user_id = p_user_id
      AND cc.is_active = true
      AND cci.bill_month >= p_period_start
      AND cci.bill_month < p_period_end;
  ELSE
    SELECT COALESCE(SUM(cci.amount), 0) INTO credit_card_spending
    FROM public.credit_card_installments cci
    JOIN public.credit_cards cc ON cci.credit_card_id = cc.id
    JOIN public.credit_card_purchases ccp ON cci.purchase_id = ccp.id
    WHERE cci.user_id = p_user_id
      AND cc.is_active = true
      AND cci.bill_month >= p_period_start
      AND cci.bill_month < p_period_end
      AND ccp.category = p_category;
  END IF;

  actual_spending := transactions_spending + credit_card_spending;
  
  RETURN actual_spending;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_stats (user_id, level, total_points)
  VALUES (new.id, 1, 0);
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_credit_card_debts_to_patrimony()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  card_record RECORD;
  installment_record RECORD;
  debt_exists BOOLEAN;
  total_remaining NUMERIC;
  next_due_date DATE;
BEGIN
  -- Para cada cartão ativo que deve ser incluído no patrimônio
  FOR card_record IN 
    SELECT cc.id, cc.name, cc.user_id
    FROM public.credit_cards cc
    WHERE cc.is_active = true 
      AND cc.include_in_patrimony = true
  LOOP
    -- Calcular o total de parcelas não pagas para este cartão
    SELECT 
      COALESCE(SUM(amount), 0) as total,
      MIN(due_date) as next_due
    INTO total_remaining, next_due_date
    FROM public.credit_card_installments
    WHERE credit_card_id = card_record.id
      AND is_paid = false;
    
    -- Verificar se já existe uma dívida para este cartão
    SELECT EXISTS(
      SELECT 1 FROM public.liabilities 
      WHERE user_id = card_record.user_id 
        AND category = 'cartao_credito'
        AND name LIKE '%' || card_record.name || '%'
    ) INTO debt_exists;
    
    -- Se há parcelas pendentes
    IF total_remaining > 0 THEN
      IF debt_exists THEN
        -- Atualizar dívida existente
        UPDATE public.liabilities 
        SET 
          remaining_amount = total_remaining,
          total_amount = total_remaining,
          due_date = next_due_date,
          updated_at = now()
        WHERE user_id = card_record.user_id 
          AND category = 'cartao_credito'
          AND name LIKE '%' || card_record.name || '%';
      ELSE
        -- Criar nova dívida
        INSERT INTO public.liabilities (
          user_id,
          name,
          category,
          total_amount,
          remaining_amount,
          interest_rate,
          due_date,
          description,
          created_at,
          updated_at
        ) VALUES (
          card_record.user_id,
          'Cartão ' || card_record.name,
          'cartao_credito',
          total_remaining,
          total_remaining,
          0, -- Juros já estão embutidos nas parcelas
          next_due_date,
          'Dívida gerada automaticamente das parcelas futuras do cartão de crédito',
          now(),
          now()
        );
      END IF;
    ELSE
      -- Se não há parcelas pendentes, remover a dívida se existir
      IF debt_exists THEN
        DELETE FROM public.liabilities 
        WHERE user_id = card_record.user_id 
          AND category = 'cartao_credito'
          AND name LIKE '%' || card_record.name || '%';
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_monthly_objectives_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
    FROM public.monthly_objectives
   WHERE user_id = NEW.user_id
     AND month = NEW.month
     AND is_active = true
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  IF cnt >= 3 AND NEW.is_active = true THEN
    RAISE EXCEPTION 'Máximo de 3 objetivos ativos por mês permitidos';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_bill_month(purchase_date date, closing_day integer)
 RETURNS date
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  current_month_closing DATE;
  previous_month_closing DATE;
  safe_closing_day INTEGER;
BEGIN
  -- Proteger closing_day para não exceder o máximo do mês
  safe_closing_day := LEAST(
    closing_day,
    EXTRACT(DAY FROM (DATE_TRUNC('month', purchase_date) + INTERVAL '1 month - 1 day'))::INTEGER
  );

  -- Fechamento mês atual
  current_month_closing := DATE_TRUNC('month', purchase_date) + (safe_closing_day - 1) * INTERVAL '1 day';

  -- Fechamento mês anterior
  previous_month_closing := DATE_TRUNC('month', purchase_date - INTERVAL '1 month') + (safe_closing_day - 1) * INTERVAL '1 day';

  -- Verificar se pertence à fatura atual ou próxima
  IF purchase_date > previous_month_closing AND purchase_date <= current_month_closing THEN
    RETURN current_month_closing;
  ELSE
    RETURN DATE_TRUNC('month', purchase_date + INTERVAL '1 month') + (safe_closing_day - 1) * INTERVAL '1 day';
  END IF;
END;
$function$;