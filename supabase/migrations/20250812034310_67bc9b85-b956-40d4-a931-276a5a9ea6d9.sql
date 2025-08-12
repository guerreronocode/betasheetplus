-- Corrigir função mark_bill_as_paid para considerar valores já pagos
CREATE OR REPLACE FUNCTION public.mark_bill_as_paid(p_bill_id uuid, p_payment_account_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
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
$function$