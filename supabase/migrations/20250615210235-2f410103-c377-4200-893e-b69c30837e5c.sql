
-- Adiciona as colunas 'liquidity' e 'maturity_date' à tabela investments
ALTER TABLE public.investments
  ADD COLUMN liquidity text NULL,
  ADD COLUMN maturity_date date NULL;
