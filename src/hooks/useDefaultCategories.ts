import { supabase } from '@/integrations/supabase/client';

// Categorias padrão do sistema
const DEFAULT_CATEGORIES = [
  // Categorias principais
  { name: 'Alimentação', parent_id: null },
  { name: 'Transporte', parent_id: null },
  { name: 'Lazer', parent_id: null },
  { name: 'Saúde', parent_id: null },
  { name: 'Educação', parent_id: null },
  { name: 'Casa', parent_id: null },
  { name: 'Trabalho', parent_id: null },
  { name: 'Salário', parent_id: null },
  { name: 'Freelance', parent_id: null },
  { name: 'Investimentos', parent_id: null },
  { name: 'Vendas', parent_id: null },
  { name: 'Outros', parent_id: null },
];

const DEFAULT_SUBCATEGORIES = [
  // Subcategorias de Alimentação
  { name: 'Supermercado', parent_name: 'Alimentação' },
  { name: 'Restaurante', parent_name: 'Alimentação' },
  { name: 'Delivery', parent_name: 'Alimentação' },
  
  // Subcategorias de Lazer
  { name: 'Cinema', parent_name: 'Lazer' },
  { name: 'Streaming', parent_name: 'Lazer' },
  { name: 'Games', parent_name: 'Lazer' },
  
  // Subcategorias de Casa
  { name: 'Aluguel', parent_name: 'Casa' },
  { name: 'Contas', parent_name: 'Casa' },
  { name: 'Manutenção', parent_name: 'Casa' },
  
  // Subcategorias de Transporte
  { name: 'Combustível', parent_name: 'Transporte' },
  { name: 'Transporte Público', parent_name: 'Transporte' },
  { name: 'Uber/Taxi', parent_name: 'Transporte' },
];

export const createDefaultCategories = async (userId: string) => {
  try {
    // Primeiro, inserir as categorias principais
    const { data: mainCategories, error: mainError } = await supabase
      .from('user_categories')
      .insert(
        DEFAULT_CATEGORIES.map(cat => ({
          user_id: userId,
          name: cat.name,
          parent_id: cat.parent_id
        }))
      )
      .select();

    if (mainError) throw mainError;

    // Criar um mapa de nome -> id das categorias principais
    const categoryMap = new Map();
    mainCategories?.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // Inserir as subcategorias
    const subcategoriesToInsert = DEFAULT_SUBCATEGORIES.map(subcat => ({
      user_id: userId,
      name: subcat.name,
      parent_id: categoryMap.get(subcat.parent_name)
    })).filter(subcat => subcat.parent_id); // Só inserir se a categoria pai existir

    if (subcategoriesToInsert.length > 0) {
      const { error: subError } = await supabase
        .from('user_categories')
        .insert(subcategoriesToInsert);

      if (subError) throw subError;
    }

    return true;
  } catch (error) {
    console.error('Erro ao criar categorias padrão:', error);
    throw error;
  }
};