-- Criar tabela de logs de investimentos
CREATE TABLE IF NOT EXISTS public.investment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_id UUID NOT NULL,
  operation_type TEXT NOT NULL, -- 'aport', 'withdraw', 'update_value'
  amount NUMERIC NOT NULL DEFAULT 0,
  previous_value NUMERIC,
  new_value NUMERIC,
  month_date DATE NOT NULL,
  bank_account_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_investment_logs_user_id ON public.investment_logs(user_id);
CREATE INDEX idx_investment_logs_investment_id ON public.investment_logs(investment_id);
CREATE INDEX idx_investment_logs_month_date ON public.investment_logs(month_date);

-- Habilitar RLS
ALTER TABLE public.investment_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own investment logs"
  ON public.investment_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investment logs"
  ON public.investment_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment logs"
  ON public.investment_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment logs"
  ON public.investment_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Criar tabela de cofres de investimentos
CREATE TABLE IF NOT EXISTS public.investment_vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investment_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  reserved_amount NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_investment_vaults_user_id ON public.investment_vaults(user_id);
CREATE INDEX idx_investment_vaults_investment_id ON public.investment_vaults(investment_id);

-- Habilitar RLS
ALTER TABLE public.investment_vaults ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own investment vaults"
  ON public.investment_vaults FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investment vaults"
  ON public.investment_vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment vaults"
  ON public.investment_vaults FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment vaults"
  ON public.investment_vaults FOR DELETE
  USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_investment_vaults_updated_at
  BEFORE UPDATE ON public.investment_vaults
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();