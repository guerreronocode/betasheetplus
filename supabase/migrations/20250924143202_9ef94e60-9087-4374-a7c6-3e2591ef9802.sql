-- Add investment_type column to investments table
ALTER TABLE public.investments 
ADD COLUMN investment_type integer DEFAULT 1;

-- Add comment to explain the enum values
COMMENT ON COLUMN public.investments.investment_type IS '0 = Renda Fixa, 1 = Renda Variável';

-- Update existing investments based on their type
-- Renda Fixa (0): savings, cdb, bonds
UPDATE public.investments 
SET investment_type = 0 
WHERE type IN ('savings', 'cdb', 'bonds');

-- Renda Variável (1): stocks, crypto, funds, real_estate, other (default)
UPDATE public.investments 
SET investment_type = 1 
WHERE type IN ('stocks', 'crypto', 'funds', 'real_estate', 'other') OR type NOT IN ('savings', 'cdb', 'bonds');