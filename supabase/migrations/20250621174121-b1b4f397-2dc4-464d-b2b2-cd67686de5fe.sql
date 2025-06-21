
-- Criar a estrutura sem a função problemática primeiro
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de objetivos mensais
CREATE TABLE IF NOT EXISTS public.monthly_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  objective_type TEXT NOT NULL CHECK (objective_type IN ('custom','suggested')),
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  target_percentage NUMERIC,
  current_percentage NUMERIC DEFAULT 0,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('value','percentage','boolean')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  category TEXT,
  related_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_monthly_obj_user_month ON public.monthly_objectives(user_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_obj_status ON public.monthly_objectives(status);
CREATE INDEX IF NOT EXISTS idx_monthly_obj_active ON public.monthly_objectives(is_active);

-- RLS
ALTER TABLE public.monthly_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_objectives ON public.monthly_objectives;
CREATE POLICY select_objectives ON public.monthly_objectives
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_objectives ON public.monthly_objectives;
CREATE POLICY insert_objectives ON public.monthly_objectives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_objectives ON public.monthly_objectives;
CREATE POLICY update_objectives ON public.monthly_objectives
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_objectives ON public.monthly_objectives;
CREATE POLICY delete_objectives ON public.monthly_objectives
  FOR DELETE USING (auth.uid() = user_id);

-- Função para verificar limite de 3 objetivos
CREATE OR REPLACE FUNCTION public.check_monthly_objectives_limit()
RETURNS TRIGGER AS $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
    FROM public.monthly_objectives
   WHERE user_id = NEW.user_id
     AND month = NEW.month
     AND is_active = true
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  IF cnt >= 3 AND NEW.is_active = true THEN
    RAISE EXCEPTION 'Máximo de 3 objetivos ativos por mês permitidos';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limite de objetivos
DROP TRIGGER IF EXISTS trg_limit_objectives ON public.monthly_objectives;
CREATE TRIGGER trg_limit_objectives
  BEFORE INSERT OR UPDATE ON public.monthly_objectives
  FOR EACH ROW EXECUTE FUNCTION public.check_monthly_objectives_limit();

-- Trigger para updated_at
DROP TRIGGER IF EXISTS handle_monthly_objectives_updated_at ON public.monthly_objectives;
CREATE TRIGGER handle_monthly_objectives_updated_at
  BEFORE UPDATE ON public.monthly_objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função de cálculo de progresso (corrigida)
CREATE OR REPLACE FUNCTION public.calculate_objective_progress(
  p_user_id UUID,
  p_month DATE,
  p_objective_id UUID
) RETURNS VOID AS $$
DECLARE
  obj RECORD;
  val NUMERIC := 0;
  pct NUMERIC := 0;
  new_st TEXT;
  obj_type TEXT;
  monthly_income NUMERIC;
  monthly_investments NUMERIC;
  current_spending NUMERIC;
  previous_spending NUMERIC;
  target_category TEXT;
BEGIN
  -- Buscar dados do objetivo
  SELECT * INTO obj
    FROM public.monthly_objectives
   WHERE id = p_objective_id
     AND user_id = p_user_id;
     
  IF NOT FOUND THEN 
    RETURN; 
  END IF;

  -- Obter tipo do objetivo
  obj_type := obj.related_data->>'type';

  -- Calcular com base no tipo
  IF obj_type = 'save_amount' THEN
    -- Calcular economia do mês (receitas - despesas)
    SELECT 
      COALESCE(
        (SELECT COALESCE(SUM(amount), 0) 
         FROM public.income  
         WHERE user_id = p_user_id 
           AND date >= p_month 
           AND date < p_month + INTERVAL '1 month') -
        (SELECT COALESCE(SUM(amount), 0) 
         FROM public.expenses 
         WHERE user_id = p_user_id 
           AND date >= p_month 
           AND date < p_month + INTERVAL '1 month'),
        0
      ) INTO val;
      
  ELSIF obj_type = 'invest_percentage' THEN
    -- Calcular percentual investido da renda
    SELECT COALESCE(SUM(amount), 0) INTO monthly_investments
    FROM public.investments
    WHERE user_id = p_user_id 
      AND purchase_date >= p_month 
      AND purchase_date < p_month + INTERVAL '1 month';
      
    SELECT COALESCE(SUM(amount), 0) INTO monthly_income
    FROM public.income
    WHERE user_id = p_user_id 
      AND date >= p_month 
      AND date < p_month + INTERVAL '1 month';
      
    IF monthly_income > 0 THEN
      pct := (monthly_investments / monthly_income) * 100;
    END IF;
    
  ELSIF obj_type = 'reduce_category_spending' THEN
    -- Comparar gastos da categoria com mês anterior
    target_category := obj.related_data->>'category';
    
    SELECT COALESCE(SUM(amount), 0) INTO current_spending
    FROM public.expenses
    WHERE user_id = p_user_id 
      AND category = target_category
      AND date >= p_month 
      AND date < p_month + INTERVAL '1 month';
      
    SELECT COALESCE(SUM(amount), 0) INTO previous_spending
    FROM public.expenses
    WHERE user_id = p_user_id 
      AND category = target_category
      AND date >= p_month - INTERVAL '1 month'
      AND date < p_month;
      
    IF previous_spending > 0 THEN
      pct := GREATEST(0, ((previous_spending - current_spending) / previous_spending) * 100);
    END IF;
    
  ELSE
    -- Manter valores atuais para tipos não reconhecidos
    val := obj.current_value;
    pct := obj.current_percentage;
  END IF;

  -- Determinar novo status
  IF obj.calculation_type = 'value' THEN
    IF val >= obj.target_value THEN
      new_st := 'completed';
    ELSIF val > 0 THEN
      new_st := 'in_progress';
    ELSE
      new_st := 'not_started';
    END IF;
  ELSE
    IF pct >= obj.target_percentage THEN
      new_st := 'completed';
    ELSIF pct > 0 THEN
      new_st := 'in_progress';
    ELSE
      new_st := 'not_started';
    END IF;
  END IF;

  -- Atualizar objetivo
  UPDATE public.monthly_objectives
     SET current_value = val,
         current_percentage = pct,
         status = new_st,
         completed_at = CASE 
           WHEN new_st = 'completed' AND obj.status <> 'completed' 
           THEN now() 
           ELSE obj.completed_at 
         END,
         updated_at = now()
   WHERE id = p_objective_id;
END;
$$ LANGUAGE plpgsql;
