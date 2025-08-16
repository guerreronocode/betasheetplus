-- Add category_type back to user_categories table
ALTER TABLE public.user_categories 
ADD COLUMN category_type text NOT NULL DEFAULT 'expense';

-- Add check constraint for category_type
ALTER TABLE public.user_categories 
ADD CONSTRAINT user_categories_category_type_check 
CHECK (category_type IN ('income', 'expense'));

-- Update existing function to include category types
CREATE OR REPLACE FUNCTION create_default_categories_for_user(target_user_id uuid)
RETURNS void AS $$
DECLARE
  main_category_id uuid;
BEGIN
  -- Insert expense categories
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Alimentação', 'expense', null),
    (target_user_id, 'Transporte', 'expense', null),
    (target_user_id, 'Lazer', 'expense', null),
    (target_user_id, 'Saúde', 'expense', null),
    (target_user_id, 'Educação', 'expense', null),
    (target_user_id, 'Casa', 'expense', null),
    (target_user_id, 'Trabalho', 'expense', null),
    (target_user_id, 'Outros', 'expense', null);

  -- Insert income categories
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Salário', 'income', null),
    (target_user_id, 'Freelance', 'income', null),
    (target_user_id, 'Investimentos', 'income', null),
    (target_user_id, 'Vendas', 'income', null),
    (target_user_id, 'Vale Refeição', 'income', null),
    (target_user_id, 'Vale Transporte', 'income', null),
    (target_user_id, 'Mesada', 'income', null),
    (target_user_id, 'Outros', 'income', null);

  -- Insert expense subcategories
  -- Get Alimentação ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Alimentação' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Supermercado', 'expense', main_category_id),
    (target_user_id, 'Restaurante', 'expense', main_category_id),
    (target_user_id, 'Delivery', 'expense', main_category_id);

  -- Get Lazer ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Lazer' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Cinema', 'expense', main_category_id),
    (target_user_id, 'Streaming', 'expense', main_category_id),
    (target_user_id, 'Games', 'expense', main_category_id);

  -- Get Transporte ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Transporte' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Combustível', 'expense', main_category_id),
    (target_user_id, 'Transporte Público', 'expense', main_category_id),
    (target_user_id, 'Uber/Taxi', 'expense', main_category_id);

  -- Get Casa ID
  SELECT id INTO main_category_id FROM public.user_categories 
  WHERE user_id = target_user_id AND name = 'Casa' AND category_type = 'expense';
  
  INSERT INTO public.user_categories (user_id, name, category_type, parent_id) VALUES
    (target_user_id, 'Aluguel', 'expense', main_category_id),
    (target_user_id, 'Contas', 'expense', main_category_id),
    (target_user_id, 'Manutenção', 'expense', main_category_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;