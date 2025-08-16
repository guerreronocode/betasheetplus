import { supabase } from '@/integrations/supabase/client';

// Categorias padrão do sistema
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentação', parent_id: null },
  { name: 'Transporte', parent_id: null },
  { name: 'Lazer', parent_id: null },
  { name: 'Saúde', parent_id: null },
  { name: 'Educação', parent_id: null },
  { name: 'Casa', parent_id: null },
  { name: 'Trabalho', parent_id: null },
  { name: 'Outros', parent_id: null },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salário', parent_id: null },
  { name: 'Freelance', parent_id: null },
  { name: 'Investimentos', parent_id: null },
  { name: 'Vendas', parent_id: null },
  { name: 'Vale Refeição', parent_id: null },
  { name: 'Vale Transporte', parent_id: null },
  { name: 'Mesada', parent_id: null },
  { name: 'Outros', parent_id: null },
];

const DEFAULT_EXPENSE_SUBCATEGORIES = [
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
    // Inserir categorias de despesas
    const { data: expenseCategories, error: expenseError } = await supabase
      .from('user_categories')
      .insert(
        DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
          user_id: userId,
          name: cat.name,
          parent_id: cat.parent_id,
          category_type: 'expense' as const
        }))
      )
      .select();

    if (expenseError) throw expenseError;

    // Inserir categorias de receitas
    const { data: incomeCategories, error: incomeError } = await supabase
      .from('user_categories')
      .insert(
        DEFAULT_INCOME_CATEGORIES.map(cat => ({
          user_id: userId,
          name: cat.name,
          parent_id: cat.parent_id,
          category_type: 'income' as const
        }))
      )
      .select();

    if (incomeError) throw incomeError;

    // Criar um mapa de nome -> id das categorias principais de despesas
    const expenseCategoryMap = new Map();
    expenseCategories?.forEach(cat => {
      expenseCategoryMap.set(cat.name, cat.id);
    });

    // Inserir as subcategorias de despesas
    const expenseSubcategoriesToInsert = DEFAULT_EXPENSE_SUBCATEGORIES.map(subcat => ({
      user_id: userId,
      name: subcat.name,
      parent_id: expenseCategoryMap.get(subcat.parent_name),
      category_type: 'expense' as const
    })).filter(subcat => subcat.parent_id); // Só inserir se a categoria pai existir

    if (expenseSubcategoriesToInsert.length > 0) {
      const { error: expenseSubError } = await supabase
        .from('user_categories')
        .insert(expenseSubcategoriesToInsert);

      if (expenseSubError) throw expenseSubError;
    }

    return true;
  } catch (error) {
    console.error('Erro ao criar categorias padrão:', error);
    throw error;
  }
};