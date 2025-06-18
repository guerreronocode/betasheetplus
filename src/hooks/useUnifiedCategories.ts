
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnifiedCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['unified-categories'],
    queryFn: async () => {
      console.log('Fetching unified categories...');
      
      // Buscar categorias únicas apenas de despesas e compras de cartão (não receitas)
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

      // Combinar todas as categorias e deduplificar
      const allCategories = [
        ...expensesResult.data.map(item => item.category),
        ...purchasesResult.data.map(item => item.category)
      ];
      
      const uniqueCategories = [...new Set(allCategories)].filter(Boolean);

      // Categorias padrão de despesas (excluindo categorias de receita)
      const defaultExpenseCategories = [
        'Alimentação',
        'Farmácia',
        'Educação',
        'Comer fora',
        'Roupas',
        'Pet',
        'Lazer',
        'Assinaturas e apps',
        'Transporte por app',
        'Compras',
        'Transporte',
        'Saúde',
        'Casa',
        'Tecnologia',
        'Viagem',
        'Cartão de Crédito',
        'Outros'
      ];

      // Mesclar categorias do banco com as padrão, removendo duplicatas
      const finalCategories = [...new Set([...defaultExpenseCategories, ...uniqueCategories])].sort();
      
      console.log('Unified expense categories fetched:', finalCategories);
      
      return finalCategories;
    },
  });

  return {
    categories,
    isLoading,
    error,
  };
};
