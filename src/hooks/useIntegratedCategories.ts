
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useIntegratedCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['integrated-categories'],
    queryFn: async () => {
      console.log('Fetching integrated categories...');
      
      // Buscar categorias únicas das despesas e compras de cartão
      const [expensesResult, purchasesResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('category')
          .order('category'),
        supabase
          .from('credit_card_purchases')
          .select(`
            category,
            credit_cards!inner(is_active)
          `)
          .eq('credit_cards.is_active', true)
          .order('category')
      ]);

      if (expensesResult.error) {
        console.error('Error fetching expense categories:', expensesResult.error);
        throw expensesResult.error;
      }

      if (purchasesResult.error) {
        console.error('Error fetching purchase categories:', purchasesResult.error);
        throw purchasesResult.error;
      }

      // Combinar e deduplificar categorias
      const allCategories = [
        ...expensesResult.data.map(item => item.category),
        ...purchasesResult.data.map(item => item.category)
      ];
      
      const uniqueCategories = [...new Set(allCategories)].filter(Boolean);
      console.log('Integrated categories fetched:', uniqueCategories);
      
      return uniqueCategories;
    },
  });

  // Categorias padrão caso não existam ainda
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
    'Cartão de Crédito',
    'Outros'
  ];

  const allCategories = categories.length > 0 ? categories : defaultCategories;

  return {
    categories: allCategories,
    isLoading,
    error,
  };
};
