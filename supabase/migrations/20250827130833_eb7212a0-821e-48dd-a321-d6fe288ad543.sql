-- Corrigir função para resolver ambiguidade da coluna upload_id
CREATE OR REPLACE FUNCTION public.process_bank_statement_upload(
  p_user_id uuid,
  p_upload_name text,
  p_bank_account_id uuid,
  p_period_start date,
  p_period_end date,
  p_transactions jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  upload_id uuid;
  transaction_record jsonb;
  balance_change numeric := 0;
  transactions_count integer := 0;
BEGIN
  -- Criar o registro de upload
  INSERT INTO public.bank_statement_uploads (
    user_id,
    upload_name,
    upload_date,
    total_transactions,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_upload_name,
    now(),
    jsonb_array_length(p_transactions),
    now(),
    now()
  ) RETURNING id INTO upload_id;
  
  -- Excluir transações manuais existentes no período da conta específica
  DELETE FROM public.income 
  WHERE income.user_id = p_user_id 
    AND income.bank_account_id = p_bank_account_id
    AND income.date >= p_period_start 
    AND income.date <= p_period_end
    AND income.upload_id IS NULL; -- Apenas transações manuais
    
  DELETE FROM public.expenses 
  WHERE expenses.user_id = p_user_id 
    AND expenses.bank_account_id = p_bank_account_id
    AND expenses.date >= p_period_start 
    AND expenses.date <= p_period_end
    AND expenses.upload_id IS NULL; -- Apenas transações manuais
  
  -- Inserir novas transações do extrato
  FOR transaction_record IN SELECT * FROM jsonb_array_elements(p_transactions)
  LOOP
    transactions_count := transactions_count + 1;
    
    IF (transaction_record->>'type')::text = 'income' THEN
      -- Inserir receita
      INSERT INTO public.income (
        user_id,
        amount,
        date,
        description,
        category,
        bank_account_id,
        upload_id,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        (transaction_record->>'amount')::numeric,
        (transaction_record->>'date')::date,
        (transaction_record->>'description')::text,
        'Outros', -- Categoria padrão
        p_bank_account_id,
        upload_id,
        now(),
        now()
      );
      
      balance_change := balance_change + (transaction_record->>'amount')::numeric;
      
    ELSE
      -- Inserir despesa
      INSERT INTO public.expenses (
        user_id,
        amount,
        date,
        description,
        category,
        bank_account_id,
        upload_id,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        (transaction_record->>'amount')::numeric,
        (transaction_record->>'date')::date,
        (transaction_record->>'description')::text,
        'Outros', -- Categoria padrão
        p_bank_account_id,
        upload_id,
        now(),
        now()
      );
      
      balance_change := balance_change - (transaction_record->>'amount')::numeric;
    END IF;
  END LOOP;
  
  -- Atualizar saldo da conta bancária
  UPDATE public.bank_accounts 
  SET balance = balance + balance_change,
      updated_at = now()
  WHERE id = p_bank_account_id 
    AND user_id = p_user_id;
  
  -- Atualizar total de transações no upload
  UPDATE public.bank_statement_uploads 
  SET total_transactions = transactions_count,
      updated_at = now()
  WHERE id = upload_id;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'uploadId', upload_id,
    'transactionsCount', transactions_count,
    'balanceImpact', balance_change,
    'success', true
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, a transação será automaticamente revertida
  RAISE EXCEPTION 'Erro ao processar upload: %', SQLERRM;
END;
$function$;