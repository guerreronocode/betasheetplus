-- Primeiro, corrigir inconsistências existentes
UPDATE public.credit_card_bills 
SET 
  is_paid = CASE 
    WHEN paid_amount >= total_amount AND total_amount > 0 THEN true 
    ELSE false 
  END,
  updated_at = now()
WHERE paid_amount != total_amount OR is_paid != (paid_amount >= total_amount AND total_amount > 0);

-- Recriar o trigger com lógica corrigida
DROP TRIGGER IF EXISTS recalculate_bill_status_trigger ON public.credit_card_installments;

CREATE OR REPLACE FUNCTION public.recalculate_bill_payment_status()
RETURNS trigger
LANGUAGE plpgsql
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

-- Recriar o trigger
CREATE TRIGGER recalculate_bill_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_card_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_bill_payment_status();