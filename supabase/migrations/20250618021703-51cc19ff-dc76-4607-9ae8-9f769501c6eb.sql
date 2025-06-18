
-- 1. Adicionar campos para controle de pagamento de faturas
ALTER TABLE public.credit_card_bills 
ADD COLUMN IF NOT EXISTS paid_date DATE,
ADD COLUMN IF NOT EXISTS paid_account_id UUID REFERENCES public.bank_accounts(id);

-- 2. Adicionar campo para incluir cartão no patrimônio
ALTER TABLE public.credit_cards 
ADD COLUMN IF NOT EXISTS include_in_patrimony BOOLEAN NOT NULL DEFAULT false;

-- 3. Função para calcular limite disponível projetado
CREATE OR REPLACE FUNCTION public.calculate_projected_credit_limit(
  p_credit_card_id UUID,
  p_months_ahead INTEGER DEFAULT 12
) RETURNS TABLE (
  month DATE,
  projected_available_limit NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- 4. Função para calcular valor patrimonial dos cartões
CREATE OR REPLACE FUNCTION public.calculate_credit_cards_patrimony(p_user_id UUID)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_paid_account ON credit_card_bills(paid_account_id);
