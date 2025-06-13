
-- Criar tabela para transações recorrentes
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias transações recorrentes
CREATE POLICY "Users can view their own recurring transactions" 
  ON public.recurring_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions" 
  ON public.recurring_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
  ON public.recurring_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
  ON public.recurring_transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_frequency ON recurring_transactions(frequency);
