-- Criar tabela para categorias hierárquicas personalizadas
CREATE TABLE public.user_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID NULL REFERENCES public.user_categories(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL DEFAULT 'expense', -- 'expense', 'income', 'both'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_hierarchy CHECK (
    (parent_id IS NULL) OR 
    (parent_id IS NOT NULL AND parent_id != id)
  ),
  CONSTRAINT unique_user_category UNIQUE(user_id, name, parent_id)
);

-- Habilitar RLS
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own categories"
ON public.user_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
ON public.user_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.user_categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.user_categories FOR DELETE
USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_user_categories_updated_at
BEFORE UPDATE ON public.user_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para validar hierarquia (máximo 2 níveis)
CREATE OR REPLACE FUNCTION public.validate_category_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se está tentando criar uma sub-categoria de uma sub-categoria
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.user_categories 
      WHERE id = NEW.parent_id AND parent_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Sub-categorias não podem ter sub-categorias. Máximo de 2 níveis de hierarquia.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação de hierarquia
CREATE TRIGGER validate_category_hierarchy_trigger
BEFORE INSERT OR UPDATE ON public.user_categories
FOR EACH ROW
EXECUTE FUNCTION public.validate_category_hierarchy();