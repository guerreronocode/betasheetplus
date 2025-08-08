-- Função para processar pagamentos parciais de faturas
CREATE OR REPLACE FUNCTION public.process_partial_bill_payment(
  p_bill_id uuid,
  p_installment_payments jsonb, -- [{installment_id: uuid, amount: numeric}]
  p_payment_account_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger para recalcular status de pagamento da fatura quando parcelas são atualizadas
CREATE OR REPLACE FUNCTION public.update_bill_payment_status_on_installment_change()
RETURNS trigger
LANGUAGE plpgsql
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

-- Criar trigger para atualizar status da fatura quando parcelas mudam
DROP TRIGGER IF EXISTS trigger_update_bill_payment_status ON public.credit_card_installments;
CREATE TRIGGER trigger_update_bill_payment_status
  AFTER UPDATE OF is_paid, paid_at, payment_account_id ON public.credit_card_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bill_payment_status_on_installment_change();