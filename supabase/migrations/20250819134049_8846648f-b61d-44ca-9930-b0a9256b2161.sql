-- Complete security hardening: Fix remaining database functions with search path protection

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_category_hierarchy()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Verificar se está tentando criar uma sub-categoria de uma sub-categoria
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.user_categories 
      WHERE id = NEW.parent_id AND parent_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Sub-categorias não podem ter sub-categorias. Máximo de 2 níveis de hierarquia.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  main_category_id uuid;
BEGIN
  -- Insert expense categories
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Alimentação', 'expense', null),
    (target_user_id, 'Transporte', 'expense', null),
    (target_user_id, 'Lazer', 'expense', null),
    (target_user_id, 'Saúde', 'expense', null),
    (target_user_id, 'Educação', 'expense', null),
    (target_user_id, 'Casa', 'expense', null),
    (target_user_id, 'Trabalho', 'expense', null),
    (target_user_id, 'Outros', 'expense', null);

  -- Insert income categories
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Salário', 'income', null),
    (target_user_id, 'Freelance', 'income', null),
    (target_user_id, 'Investimentos', 'income', null),
    (target_user_id, 'Vendas', 'income', null),
    (target_user_id, 'Vale Refeição', 'income', null),
    (target_user_id, 'Vale Transporte', 'income', null),
    (target_user_id, 'Mesada', 'income', null),
    (target_user_id, 'Outros', 'income', null);

  -- Insert expense subcategories
  -- Get Alimentação ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Alimentação' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Supermercado', 'expense', main_category_id),
    (target_user_id, 'Restaurante', 'expense', main_category_id),
    (target_user_id, 'Delivery', 'expense', main_category_id);

  -- Get Lazer ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Lazer' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Cinema', 'expense', main_category_id),
    (target_user_id, 'Streaming', 'expense', main_category_id),
    (target_user_id, 'Games', 'expense', main_category_id);

  -- Get Transporte ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Transporte' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Combustível', 'expense', main_category_id),
    (target_user_id, 'Transporte Público', 'expense', main_category_id),
    (target_user_id, 'Uber/Taxi', 'expense', main_category_id);

  -- Get Casa ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Casa' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Aluguel', 'expense', main_category_id),
    (target_user_id, 'Contas', 'expense', main_category_id),
    (target_user_id, 'Manutenção', 'expense', main_category_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.reverse_bill_payment(p_bill_id uuid, p_reversal_amount numeric DEFAULT NULL::numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  bill_record RECORD;
  new_paid_amount NUMERIC;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO bill_record
  FROM public.credit_card_bills
  WHERE id = p_bill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fatura não encontrada';
  END IF;
  
  -- Calcular novo valor pago (estorno total ou parcial)
  IF p_reversal_amount IS NULL THEN
    new_paid_amount := 0; -- Estorno total
  ELSE
    new_paid_amount := GREATEST(0, COALESCE(bill_record.paid_amount, 0) - p_reversal_amount);
  END IF;
  
  -- Atualizar fatura
  UPDATE public.credit_card_bills
  SET 
    paid_amount = new_paid_amount,
    is_paid = (new_paid_amount >= total_amount AND total_amount > 0),
    paid_at = CASE 
      WHEN new_paid_amount < total_amount 
      THEN NULL 
      ELSE paid_at 
    END,
    updated_at = now()
  WHERE id = p_bill_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recalculate_bill_payment_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  bill_total NUMERIC;
  bill_paid_amount NUMERIC;
BEGIN
  -- Calcular o novo total da fatura
  SELECT COALESCE(SUM(amount), 0) INTO bill_total
  FROM public.credit_card_installments
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  -- Obter o valor já pago da fatura
  SELECT COALESCE(paid_amount, 0) INTO bill_paid_amount
  FROM public.credit_card_bills
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  -- Atualizar a fatura com novo total e status recalculado
  UPDATE public.credit_card_bills
  SET 
    total_amount = bill_total,
    is_paid = (bill_paid_amount >= bill_total AND bill_total > 0),
    updated_at = now()
  WHERE credit_card_id = COALESCE(NEW.credit_card_id, OLD.credit_card_id)
    AND bill_month = COALESCE(NEW.bill_month, OLD.bill_month);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_partial_bill_payment(p_bill_id uuid, p_installment_payments jsonb, p_payment_account_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  bill_record RECORD;
  payment_record RECORD;
  total_payment_amount NUMERIC := 0;
  new_paid_amount NUMERIC;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO bill_record
  FROM public.credit_card_bills
  WHERE id = p_bill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fatura não encontrada';
  END IF;
  
  -- Processar cada pagamento de parcela
  FOR payment_record IN SELECT * FROM jsonb_to_recordset(p_installment_payments) AS x(installment_id uuid, amount numeric)
  LOOP
    -- Verificar se a parcela existe e pertence à fatura
    IF NOT EXISTS (
      SELECT 1 FROM public.credit_card_installments 
      WHERE id = payment_record.installment_id 
        AND credit_card_id = bill_record.credit_card_id
        AND bill_month = bill_record.bill_month
    ) THEN
      RAISE EXCEPTION 'Parcela % não encontrada ou não pertence a esta fatura', payment_record.installment_id;
    END IF;
    
    -- Somar ao total do pagamento
    total_payment_amount := total_payment_amount + payment_record.amount;
    
    -- Marcar parcela como paga (se valor for total) ou atualizar valor pago
    UPDATE public.credit_card_installments
    SET 
      is_paid = (payment_record.amount >= amount),
      paid_at = CASE 
        WHEN payment_record.amount >= amount 
        THEN now() 
        ELSE paid_at 
      END,
      payment_account_id = p_payment_account_id,
      updated_at = now()
    WHERE id = payment_record.installment_id;
  END LOOP;
  
  -- Atualizar fatura com novo valor pago
  new_paid_amount := COALESCE(bill_record.paid_amount, 0) + total_payment_amount;
  
  UPDATE public.credit_card_bills
  SET 
    paid_amount = new_paid_amount,
    is_paid = (new_paid_amount >= total_amount AND total_amount > 0),
    payment_account_id = COALESCE(p_payment_account_id, payment_account_id),
    paid_at = CASE 
      WHEN (new_paid_amount >= total_amount AND total_amount > 0) AND is_paid = false 
      THEN now() 
      ELSE paid_at 
    END,
    updated_at = now()
  WHERE id = p_bill_id;
  
  -- Debitar da conta bancária se especificada
  IF p_payment_account_id IS NOT NULL THEN
    UPDATE public.bank_accounts
    SET 
      balance = balance - total_payment_amount,
      updated_at = now()
    WHERE id = p_payment_account_id;
  END IF;
  
  RETURN true;
END;
$function$;