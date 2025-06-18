
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useExpenseCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      console.log('Fetching expense categories...');
      const { data, error } = await supabase
        .from('expenses')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Extrair categorias únicas
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      console.log('Categories fetched:', uniqueCategories);
      
      return uniqueCategories;
    },
  });

  // Categorias padrão caso não existam despesas ainda
  const defaultCategories = [
    'Alimentação',
    'Transporte', 
    'Lazer',
    'Saúde',
    'Educação',
    'Casa',
    'Roupas',
    'Tecnologia',
    'Viagem',
    'Outros'
  ];

  const allCategories = categories.length > 0 ? categories : defaultCategories;

  return {
    categories: allCategories,
    isLoading,
    error,
  };
};
