
-- Função para sincronizar parcelas de cartão de crédito como dívidas no patrimônio
CREATE OR REPLACE FUNCTION public.sync_credit_card_debts_to_patrimony()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- Trigger para executar a sincronização automaticamente quando parcelas são atualizadas
CREATE OR REPLACE FUNCTION public.trigger_sync_credit_card_debts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Executar a sincronização em background para não afetar performance
  PERFORM public.sync_credit_card_debts_to_patrimony();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar triggers para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_credit_debts_on_installment_change ON public.credit_card_installments;
CREATE TRIGGER sync_credit_debts_on_installment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_card_installments
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_credit_card_debts();

DROP TRIGGER IF EXISTS sync_credit_debts_on_purchase_change ON public.credit_card_purchases;
CREATE TRIGGER sync_credit_debts_on_purchase_change
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_card_purchases
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_credit_card_debts();

DROP TRIGGER IF EXISTS sync_credit_debts_on_card_change ON public.credit_cards;
CREATE TRIGGER sync_credit_debts_on_card_change
  AFTER UPDATE ON public.credit_cards
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_credit_card_debts();
