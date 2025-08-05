-- Remove a constraint que impede múltiplas receitas da mesma categoria no mesmo mês
ALTER TABLE public.planned_income DROP CONSTRAINT IF EXISTS planned_income_user_id_month_category_key;

-- Remove a constraint que impede múltiplas despesas da mesma categoria no mesmo mês  
ALTER TABLE public.planned_expenses DROP CONSTRAINT IF EXISTS planned_expenses_user_id_month_category_key;