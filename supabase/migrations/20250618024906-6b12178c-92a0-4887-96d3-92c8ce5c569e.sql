
-- Adicionar coluna category na tabela credit_card_purchases
ALTER TABLE public.credit_card_purchases 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Atualizar compras existentes com uma categoria padrão
UPDATE public.credit_card_purchases 
SET category = 'Outros' 
WHERE category IS NULL;

-- Tornar a coluna obrigatória após preencher os dados existentes
ALTER TABLE public.credit_card_purchases 
ALTER COLUMN category SET NOT NULL;
