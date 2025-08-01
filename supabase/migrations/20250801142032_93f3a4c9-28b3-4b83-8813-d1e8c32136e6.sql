-- Adicionar campos para receitas recorrentes na tabela planned_income
ALTER TABLE public.planned_income 
ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
ADD COLUMN recurring_start_month date,
ADD COLUMN recurring_end_month date;