
-- 0. Garantir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Criar a função de trigger de updated_at, se ainda não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para calcular mês da fatura (STABLE para segurança)
CREATE OR REPLACE FUNCTION public.calculate_bill_month(
  purchase_date DATE,
  closing_day INTEGER
) RETURNS DATE AS $$
BEGIN
  -- Se a compra foi feita antes do fechamento, vai para a fatura do mês atual
  -- Se foi depois do fechamento, vai para a fatura do mês seguinte
  IF EXTRACT(DAY FROM purchase_date) <= closing_day THEN
    RETURN DATE_TRUNC('month', purchase_date)::DATE;
  ELSE
    RETURN DATE_TRUNC('month', purchase_date + INTERVAL '1 month')::DATE;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Criar tabela para cartões de crédito
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela para compras no cartão
CREATE TABLE IF NOT EXISTS public.credit_card_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  installments INTEGER NOT NULL DEFAULT 1 CHECK (installments > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Criar tabela para parcelas
CREATE TABLE IF NOT EXISTS public.credit_card_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  purchase_id UUID NOT NULL REFERENCES public.credit_card_purchases(id) ON DELETE CASCADE,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  bill_month DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(purchase_id, installment_number)
);

-- 6. Criar tabela para faturas
CREATE TABLE IF NOT EXISTS public.credit_card_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  bill_month DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  closing_date DATE NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(credit_card_id, bill_month)
);

-- 7. Habilitar RLS para todas as tabelas
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_bills ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para credit_cards (com proteção contra duplicidade)
DROP POLICY IF EXISTS "Users can view their own credit cards" ON public.credit_cards;
CREATE POLICY "Users can view their own credit cards" ON credit_cards 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own credit cards" ON public.credit_cards;
CREATE POLICY "Users can create their own credit cards" ON credit_cards 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credit cards" ON public.credit_cards;
CREATE POLICY "Users can update their own credit cards" ON credit_cards 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own credit cards" ON public.credit_cards;
CREATE POLICY "Users can delete their own credit cards" ON credit_cards 
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Políticas RLS para credit_card_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can view their own purchases" ON credit_card_purchases 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can create their own purchases" ON credit_card_purchases 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can update their own purchases" ON credit_card_purchases 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can delete their own purchases" ON credit_card_purchases 
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Políticas RLS para credit_card_installments
DROP POLICY IF EXISTS "Users can view their own installments" ON public.credit_card_installments;
CREATE POLICY "Users can view their own installments" ON credit_card_installments 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own installments" ON public.credit_card_installments;
CREATE POLICY "Users can create their own installments" ON credit_card_installments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own installments" ON public.credit_card_installments;
CREATE POLICY "Users can update their own installments" ON credit_card_installments 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own installments" ON public.credit_card_installments;
CREATE POLICY "Users can delete their own installments" ON credit_card_installments 
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Políticas RLS para credit_card_bills
DROP POLICY IF EXISTS "Users can view their own bills" ON public.credit_card_bills;
CREATE POLICY "Users can view their own bills" ON credit_card_bills 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bills" ON public.credit_card_bills;
CREATE POLICY "Users can create their own bills" ON credit_card_bills 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bills" ON public.credit_card_bills;
CREATE POLICY "Users can update their own bills" ON credit_card_bills 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bills" ON public.credit_card_bills;
CREATE POLICY "Users can delete their own bills" ON credit_card_bills 
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Função de processamento de compras (criada antes do trigger)
CREATE OR REPLACE FUNCTION public.process_credit_card_purchase()
RETURNS TRIGGER AS $$
DECLARE
  card_record RECORD;
  installment_amount NUMERIC;
  current_bill_month DATE;
  current_due_date DATE;
  safe_due_day INTEGER;
  safe_closing_day INTEGER;
  closing_date DATE;
  i INTEGER;
BEGIN
  -- Buscar dados do cartão
  SELECT closing_day, due_day INTO card_record
  FROM public.credit_cards
  WHERE id = NEW.credit_card_id;
  
  -- Valor de cada parcela
  installment_amount := NEW.amount / NEW.installments;
  
  FOR i IN 1..NEW.installments LOOP
    -- Mês da fatura (com cast explícito para DATE)
    current_bill_month := calculate_bill_month(
      (NEW.purchase_date + (i - 1) * INTERVAL '1 month')::DATE,
      card_record.closing_day
    );
    
    -- Dia máximo de vencimento naquele mês
    safe_due_day := LEAST(
      card_record.due_day,
      EXTRACT(
        DAY 
        FROM (current_bill_month + INTERVAL '1 month' - INTERVAL '1 day')
      )::INTEGER
    );
    
    -- Data de vencimento: primeiro dia do próximo mês + offset
    current_due_date := 
      DATE_TRUNC('month', current_bill_month + INTERVAL '1 month')
      + (safe_due_day - 1) * INTERVAL '1 day';
    
    -- Dia máximo de fechamento naquele mês
    safe_closing_day := LEAST(
      card_record.closing_day,
      EXTRACT(
        DAY 
        FROM (current_bill_month + INTERVAL '1 month' - INTERVAL '1 day')
      )::INTEGER
    );
    
    -- Data de fechamento: primeiro dia do mês + offset
    closing_date := 
      DATE_TRUNC('month', current_bill_month)
      + (safe_closing_day - 1) * INTERVAL '1 day';
    
    -- Inserir parcela com auditoria completa
    INSERT INTO public.credit_card_installments (
      user_id, purchase_id, credit_card_id,
      installment_number, amount, due_date, bill_month,
      created_at, updated_at
    ) VALUES (
      NEW.user_id, NEW.id, NEW.credit_card_id,
      i, installment_amount, current_due_date, current_bill_month,
      now(), now()
    );
    
    -- Criar ou atualizar fatura usando EXCLUDED para soma consistente
    INSERT INTO public.credit_card_bills (
      user_id, credit_card_id, bill_month,
      total_amount, closing_date, due_date,
      updated_at
    ) VALUES (
      NEW.user_id, NEW.credit_card_id, current_bill_month,
      installment_amount, closing_date, current_due_date,
      now()
    )
    ON CONFLICT (credit_card_id, bill_month) DO UPDATE SET
      total_amount = credit_card_bills.total_amount + EXCLUDED.total_amount,
      updated_at   = now();
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Triggers para updated_at
DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON public.credit_cards;
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_credit_card_purchases_updated_at ON public.credit_card_purchases;
CREATE TRIGGER update_credit_card_purchases_updated_at
  BEFORE UPDATE ON public.credit_card_purchases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_credit_card_installments_updated_at ON public.credit_card_installments;
CREATE TRIGGER update_credit_card_installments_updated_at
  BEFORE UPDATE ON public.credit_card_installments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_credit_card_bills_updated_at ON public.credit_card_bills;
CREATE TRIGGER update_credit_card_bills_updated_at
  BEFORE UPDATE ON public.credit_card_bills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 14. Trigger de processamento de compras
DROP TRIGGER IF EXISTS process_purchase_trigger ON public.credit_card_purchases;
CREATE TRIGGER process_purchase_trigger
  AFTER INSERT ON public.credit_card_purchases
  FOR EACH ROW EXECUTE FUNCTION public.process_credit_card_purchase();

-- 15. Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_purchases_user_id ON credit_card_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_purchases_card_id ON credit_card_purchases(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_installments_user_id ON credit_card_installments(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_installments_card_month ON credit_card_installments(credit_card_id, bill_month);
CREATE INDEX IF NOT EXISTS idx_credit_card_installments_is_paid ON credit_card_installments(is_paid);
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_user_id ON credit_card_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_card_id ON credit_card_bills(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_bills_is_paid ON credit_card_bills(is_paid);
