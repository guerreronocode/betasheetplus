-- Criar tabela para receitas previstas mensais
CREATE TABLE public.planned_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL, -- Primeiro dia do mês (ex: 2024-01-01 para janeiro de 2024)
  category TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para não permitir duplicatas do mesmo usuário/mês/categoria
  UNIQUE(user_id, month, category)
);

-- Habilitar RLS
ALTER TABLE public.planned_income ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own planned income" 
ON public.planned_income 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_planned_income_updated_at
  BEFORE UPDATE ON public.planned_income
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();