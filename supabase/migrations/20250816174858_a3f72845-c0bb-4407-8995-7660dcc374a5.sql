-- Remove a coluna category_type da tabela user_categories
ALTER TABLE public.user_categories DROP COLUMN category_type;

-- Inserir categorias padrão unificadas (sem distinção de tipo)
INSERT INTO public.user_categories (user_id, name, parent_id) VALUES 
-- Categorias principais
(NULL, 'Alimentação', NULL),
(NULL, 'Transporte', NULL),
(NULL, 'Lazer', NULL),
(NULL, 'Saúde', NULL),
(NULL, 'Educação', NULL),
(NULL, 'Casa', NULL),
(NULL, 'Trabalho', NULL),
(NULL, 'Outros', NULL),
(NULL, 'Salário', NULL),
(NULL, 'Freelance', NULL),
(NULL, 'Investimentos', NULL),
(NULL, 'Vendas', NULL)
ON CONFLICT DO NOTHING;

-- Inserir subcategorias de exemplo
INSERT INTO public.user_categories (user_id, name, parent_id) VALUES 
-- Subcategorias de Alimentação
(NULL, 'Supermercado', (SELECT id FROM public.user_categories WHERE name = 'Alimentação' AND user_id IS NULL LIMIT 1)),
(NULL, 'Restaurante', (SELECT id FROM public.user_categories WHERE name = 'Alimentação' AND user_id IS NULL LIMIT 1)),
(NULL, 'Delivery', (SELECT id FROM public.user_categories WHERE name = 'Alimentação' AND user_id IS NULL LIMIT 1)),

-- Subcategorias de Lazer
(NULL, 'Cinema', (SELECT id FROM public.user_categories WHERE name = 'Lazer' AND user_id IS NULL LIMIT 1)),
(NULL, 'Streaming', (SELECT id FROM public.user_categories WHERE name = 'Lazer' AND user_id IS NULL LIMIT 1)),
(NULL, 'Games', (SELECT id FROM public.user_categories WHERE name = 'Lazer' AND user_id IS NULL LIMIT 1)),

-- Subcategorias de Casa
(NULL, 'Aluguel', (SELECT id FROM public.user_categories WHERE name = 'Casa' AND user_id IS NULL LIMIT 1)),
(NULL, 'Contas', (SELECT id FROM public.user_categories WHERE name = 'Casa' AND user_id IS NULL LIMIT 1)),
(NULL, 'Manutenção', (SELECT id FROM public.user_categories WHERE name = 'Casa' AND user_id IS NULL LIMIT 1))
ON CONFLICT DO NOTHING;