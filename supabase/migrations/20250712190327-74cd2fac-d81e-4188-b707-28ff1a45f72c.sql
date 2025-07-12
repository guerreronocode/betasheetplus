-- Adicionar campo para rastrear origem das transações recorrentes
ALTER TABLE public.income 
ADD COLUMN recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE CASCADE;

ALTER TABLE public.expenses 
ADD COLUMN recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE CASCADE;

-- Criar índices para melhor performance nas consultas
CREATE INDEX idx_income_recurring_transaction_id ON public.income(recurring_transaction_id);
CREATE INDEX idx_expenses_recurring_transaction_id ON public.expenses(recurring_transaction_id);