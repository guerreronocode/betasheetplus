-- Criar tabela para armazenar configurações de investimento do usuário
CREATE TABLE IF NOT EXISTS public.user_investment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  financial_independence_goal numeric NOT NULL DEFAULT 0,
  average_monthly_income numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_investment_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own investment settings"
  ON public.user_investment_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment settings"
  ON public.user_investment_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment settings"
  ON public.user_investment_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment settings"
  ON public.user_investment_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Criar índice para melhorar performance
CREATE INDEX idx_user_investment_settings_user_id ON public.user_investment_settings(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_investment_settings_updated_at
  BEFORE UPDATE ON public.user_investment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();