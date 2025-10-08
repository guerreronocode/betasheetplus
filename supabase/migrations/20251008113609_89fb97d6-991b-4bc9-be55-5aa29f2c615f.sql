-- Criar tabela para armazenar valores mensais de investimentos
CREATE TABLE IF NOT EXISTS public.investment_monthly_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_id UUID NOT NULL,
  month_date DATE NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  applied_value NUMERIC NOT NULL DEFAULT 0,
  yield_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(investment_id, month_date)
);

-- Habilitar RLS
ALTER TABLE public.investment_monthly_values ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own investment monthly values"
ON public.investment_monthly_values
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_investment_monthly_values_user_id ON public.investment_monthly_values(user_id);
CREATE INDEX idx_investment_monthly_values_investment_id ON public.investment_monthly_values(investment_id);
CREATE INDEX idx_investment_monthly_values_month_date ON public.investment_monthly_values(month_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_investment_monthly_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investment_monthly_values_updated_at
BEFORE UPDATE ON public.investment_monthly_values
FOR EACH ROW
EXECUTE FUNCTION update_investment_monthly_values_updated_at();