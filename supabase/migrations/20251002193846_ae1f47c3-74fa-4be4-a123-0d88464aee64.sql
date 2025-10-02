-- Migração: Mover transações futuras para tabelas de planejamento
-- E criar triggers para validação de datas

-- 1. Mover receitas futuras de income para planned_income
INSERT INTO public.planned_income (user_id, month, planned_amount, category, description, is_recurring, created_at, updated_at)
SELECT 
  user_id,
  date as month,
  amount as planned_amount,
  category,
  description,
  false as is_recurring,
  created_at,
  updated_at
FROM public.income
WHERE date > CURRENT_DATE;

-- 2. Mover despesas futuras de expenses para planned_expenses
INSERT INTO public.planned_expenses (user_id, month, planned_amount, category, description, is_recurring, created_at, updated_at)
SELECT 
  user_id,
  date as month,
  amount as planned_amount,
  category,
  description,
  false as is_recurring,
  created_at,
  updated_at
FROM public.expenses
WHERE date > CURRENT_DATE;

-- 3. Remover receitas futuras da tabela income
DELETE FROM public.income WHERE date > CURRENT_DATE;

-- 4. Remover despesas futuras da tabela expenses
DELETE FROM public.expenses WHERE date > CURRENT_DATE;

-- 5. Criar função de validação para impedir transações futuras em income
CREATE OR REPLACE FUNCTION public.validate_income_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Transações futuras devem ser criadas como planned_income, não como income efetivado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 6. Criar função de validação para impedir transações futuras em expenses
CREATE OR REPLACE FUNCTION public.validate_expense_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Transações futuras devem ser criadas como planned_expenses, não como expenses efetivado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 7. Criar trigger para income
DROP TRIGGER IF EXISTS check_income_date ON public.income;
CREATE TRIGGER check_income_date
  BEFORE INSERT OR UPDATE ON public.income
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_income_date();

-- 8. Criar trigger para expenses
DROP TRIGGER IF EXISTS check_expense_date ON public.expenses;
CREATE TRIGGER check_expense_date
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expense_date();