
-- Criar tabela para dívidas
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creditor TEXT NOT NULL,
  description TEXT NOT NULL,
  financed_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_installments INTEGER NOT NULL,
  installment_value NUMERIC NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'paid', 'overdue', 'renegotiated')),
  notes TEXT,
  -- Campos calculados
  total_debt_amount NUMERIC NOT NULL,
  remaining_balance NUMERIC NOT NULL,
  total_interest_amount NUMERIC NOT NULL,
  total_interest_percentage NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias dívidas
CREATE POLICY "Users can view their own debts" 
  ON public.debts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" 
  ON public.debts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
  ON public.debts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
  ON public.debts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
