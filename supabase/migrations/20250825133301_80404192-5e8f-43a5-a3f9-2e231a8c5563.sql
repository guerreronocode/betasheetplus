-- Adicionar coluna display_order para salvar a ordem das categorias
ALTER TABLE public.user_categories 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Atualizar categorias existentes com ordem baseada no nome (ordem alfabética atual)
UPDATE public.user_categories 
SET display_order = (
  SELECT ROW_NUMBER() OVER (
    PARTITION BY user_id, category_type, parent_id 
    ORDER BY name
  ) 
  FROM public.user_categories uc2 
  WHERE uc2.id = user_categories.id
);

-- Criar índice para melhor performance nas consultas ordenadas
CREATE INDEX idx_user_categories_order ON public.user_categories(user_id, category_type, parent_id, display_order);