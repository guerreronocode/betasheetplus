
-- Tabela principal de orçamentos
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'yearly')),
  period_date DATE NOT NULL, -- 2025-06-01 para mensal, 2025-01-01 para anual
  total_amount NUMERIC, -- Valor total geral (opcional)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_type, period_date, is_active) -- Apenas um orçamento ativo por período
);

-- Tabela de orçamentos por categoria
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(budget_id, category) -- Uma categoria por orçamento
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget ON public.budget_categories(budget_id);

-- RLS para budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_budgets ON public.budgets;
CREATE POLICY select_budgets ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_budgets ON public.budgets;
CREATE POLICY insert_budgets ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_budgets ON public.budgets;
CREATE POLICY update_budgets ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_budgets ON public.budgets;
CREATE POLICY delete_budgets ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para budget_categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_budget_categories ON public.budget_categories;
CREATE POLICY select_budget_categories ON public.budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      WHERE b.id = budget_categories.budget_id 
      AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS insert_budget_categories ON public.budget_categories;
CREATE POLICY insert_budget_categories ON public.budget_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      WHERE b.id = budget_categories.budget_id 
      AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS update_budget_categories ON public.budget_categories;
CREATE POLICY update_budget_categories ON public.budget_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      WHERE b.id = budget_categories.budget_id 
      AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS delete_budget_categories ON public.budget_categories;
CREATE POLICY delete_budget_categories ON public.budget_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      WHERE b.id = budget_categories.budget_id 
      AND b.user_id = auth.uid()
    )
  );

-- Triggers para updated_at
DROP TRIGGER IF EXISTS handle_budgets_updated_at ON public.budgets;
CREATE TRIGGER handle_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_budget_categories_updated_at ON public.budget_categories;
CREATE TRIGGER handle_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para calcular gastos realizados (transações + cartão de crédito)
CREATE OR REPLACE FUNCTION public.calculate_actual_spending(
  p_user_id UUID,
  p_period_start DATE,
  p_period_end DATE,
  p_category TEXT DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  actual_spending NUMERIC := 0;
  transactions_spending NUMERIC := 0;
  credit_card_spending NUMERIC := 0;
BEGIN
  -- Gastos em transações normais
  IF p_category IS NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO transactions_spending
    FROM public.expenses
    WHERE user_id = p_user_id
      AND date >= p_period_start
      AND date < p_period_end;
  ELSE
    SELECT COALESCE(SUM(amount), 0) INTO transactions_spending
    FROM public.expenses
    WHERE user_id = p_user_id
      AND date >= p_period_start
      AND date < p_period_end
      AND category = p_category;
  END IF;

  -- Gastos no cartão de crédito (por mês da fatura)
  IF p_category IS NULL THEN
    SELECT COALESCE(SUM(cci.amount), 0) INTO credit_card_spending
    FROM public.credit_card_installments cci
    JOIN public.credit_cards cc ON cci.credit_card_id = cc.id
    WHERE cci.user_id = p_user_id
      AND cc.is_active = true
      AND cci.bill_month >= p_period_start
      AND cci.bill_month < p_period_end;
  ELSE
    SELECT COALESCE(SUM(cci.amount), 0) INTO credit_card_spending
    FROM public.credit_card_installments cci
    JOIN public.credit_cards cc ON cci.credit_card_id = cc.id
    JOIN public.credit_card_purchases ccp ON cci.purchase_id = ccp.id
    WHERE cci.user_id = p_user_id
      AND cc.is_active = true
      AND cci.bill_month >= p_period_start
      AND cci.bill_month < p_period_end
      AND ccp.category = p_category;
  END IF;

  actual_spending := transactions_spending + credit_card_spending;
  
  RETURN actual_spending;
END;
$$ LANGUAGE plpgsql STABLE;
