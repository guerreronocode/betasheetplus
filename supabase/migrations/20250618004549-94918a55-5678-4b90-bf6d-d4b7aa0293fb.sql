
-- Adicionar coluna category na tabela debts
ALTER TABLE public.debts ADD COLUMN category TEXT;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_debts_category ON debts(category);
