-- Adicionar campo paid_amount para controlar pagamentos parciais
ALTER TABLE public.credit_card_bills 
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Inicializar paid_amount com base no status atual
UPDATE public.credit_card_bills 
SET paid_amount = CASE 
  WHEN is_paid = true THEN total_amount 
  ELSE 0 
END;

-- Função para recalcular status de pagamento das faturas
CREATE OR REPLACE FUNCTION public.recalculate_bill_payment_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger para recalcular status quando parcelas são inseridas/atualizadas/deletadas
DROP TRIGGER IF EXISTS trigger_recalculate_bill_payment_status ON public.credit_card_installments;
CREATE TRIGGER trigger_recalculate_bill_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_card_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_bill_payment_status();

-- Função para processar pagamento de fatura (atualizar paid_amount)
CREATE OR REPLACE FUNCTION public.process_bill_payment(
  p_bill_id UUID,
  p_payment_amount NUMERIC,
  p_payment_account_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar fatura como totalmente paga
CREATE OR REPLACE FUNCTION public.mark_bill_as_paid(
  p_bill_id UUID,
  p_payment_account_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  bill_record RECORD;
BEGIN
  -- Buscar dados da fatura
  SELECT * INTO bill_record
  FROM public.credit_card_bills
  WHERE id = p_bill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fatura não encontrada';
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
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estornar pagamento de fatura
CREATE OR REPLACE FUNCTION public.reverse_bill_payment(
  p_bill_id UUID,
  p_reversal_amount NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;