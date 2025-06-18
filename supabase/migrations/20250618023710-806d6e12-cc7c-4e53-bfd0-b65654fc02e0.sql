
-- Função robusta para calcular o mês de fechamento da fatura
CREATE OR REPLACE FUNCTION public.calculate_bill_month(purchase_date date, closing_day integer)
RETURNS date
LANGUAGE plpgsql
STABLE
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

-- Função corrigida de processamento com melhorias
CREATE OR REPLACE FUNCTION public.process_credit_card_purchase()
RETURNS trigger
LANGUAGE plpgsql
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
      bill_closing_date := calculate_bill_month(installment_date, card_record.closing_day);
      
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
        total_amount = credit_card_bills.total_amount + EXCLUDED.total_amount,
        updated_at = now();
    END;
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Adicionar índices compostos para performance
CREATE INDEX IF NOT EXISTS idx_bills_card_user ON public.credit_card_bills(credit_card_id, user_id);
CREATE INDEX IF NOT EXISTS idx_installments_card_bill ON public.credit_card_installments(credit_card_id, bill_month);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.credit_card_bills(due_date) WHERE is_paid = false;
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.credit_card_installments(due_date) WHERE is_paid = false;

-- Adicionar colunas de auditoria para preparação futura
ALTER TABLE public.credit_card_bills 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.bank_accounts(id);

ALTER TABLE public.credit_card_installments 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.bank_accounts(id);

-- Adicionar flag para patrimônio (já existe include_in_patrimony, mas garantindo consistência)
ALTER TABLE public.credit_cards 
ADD COLUMN IF NOT EXISTS add_to_net_worth BOOLEAN NOT NULL DEFAULT TRUE;

-- Atualizar dados existentes para nova coluna
UPDATE public.credit_cards 
SET add_to_net_worth = include_in_patrimony 
WHERE add_to_net_worth IS NULL;

-- Trigger para atualizar paid_at quando is_paid muda para true
CREATE OR REPLACE FUNCTION public.update_paid_at()
RETURNS trigger
LANGUAGE plpgsql
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

-- Aplicar trigger nas duas tabelas
DROP TRIGGER IF EXISTS trigger_update_paid_at_bills ON public.credit_card_bills;
CREATE TRIGGER trigger_update_paid_at_bills
  BEFORE UPDATE ON public.credit_card_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_paid_at();

DROP TRIGGER IF EXISTS trigger_update_paid_at_installments ON public.credit_card_installments;
CREATE TRIGGER trigger_update_paid_at_installments
  BEFORE UPDATE ON public.credit_card_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_paid_at();

-- Documentação completa da lógica
COMMENT ON FUNCTION public.calculate_bill_month(date, integer) IS 
'LÓGICA DE FATURAMENTO DO CARTÃO DE CRÉDITO:

Regra Principal:
- Compras entre (fechamento anterior + 1) e (fechamento atual) vão para fatura do mês atual
- Retorna a data de fechamento da fatura (dia DD do mês correto)
- A fatura leva o nome do mês da data de fechamento

Exemplo prático:
- Compra: 15/05/2025, Fechamento: dia 15
- Período da fatura: 16/04 até 15/05  
- Nome da fatura: Maio/2025
- Data de fechamento: 15/05/2025
- Data de vencimento: 06/06/2025 (se due_day = 6)

Proteções implementadas:
- Ajusta closing_day para meses com menos dias (fev, abr, jun, set, nov)
- Garante que nunca exceda o último dia do mês';

COMMENT ON FUNCTION public.process_credit_card_purchase() IS
'PROCESSAMENTO DE COMPRAS NO CARTÃO:

Fluxo:
1. Valida se closing_day ≠ due_day (evita edge cases)
2. Para cada parcela:
   - Calcula data de fechamento usando calculate_bill_month()
   - bill_cycle_month = primeiro dia do mês da data de fechamento (ID da fatura)
   - due_date = due_day do mês seguinte ao fechamento
3. Gera parcelas e faturas respeitando a lógica correta

Preparação para módulos futuros:
- Índices otimizados para dashboards
- Campos de auditoria (paid_at, payment_account_id)
- Flag add_to_net_worth para cálculo de patrimônio
- Triggers automáticos para controle de pagamento';

-- Constraint para evitar closing_day = due_day em novos cartões
ALTER TABLE public.credit_cards 
ADD CONSTRAINT check_closing_due_different 
CHECK (closing_day != due_day);
