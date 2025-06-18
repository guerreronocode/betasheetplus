
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
      
      // Buscar categorias únicas de todas as fontes: despesas, receitas e compras de cartão
      const [expensesResult, incomeResult, purchasesResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('category')
          .order('category'),
        supabase
          .from('income')
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

      if (incomeResult.error) {
        console.error('Error fetching income categories:', incomeResult.error);
        throw incomeResult.error;
      }

      if (purchasesResult.error) {
        console.error('Error fetching purchase categories:', purchasesResult.error);
        throw purchasesResult.error;
      }

      // Combinar todas as categorias e deduplificar
      const allCategories = [
        ...expensesResult.data.map(item => item.category),
        ...incomeResult.data.map(item => item.category),
        ...purchasesResult.data.map(item => item.category)
      ];
      
      const uniqueCategories = [...new Set(allCategories)].filter(Boolean);

      // Categorias padrão que devem estar sempre disponíveis (baseadas no AddTransactionForm)
      const defaultCategories = [
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
        'Salário',
        'Freelance',
        'Investimentos',
        'Aluguel',
        'Vendas',
        'Outros'
      ];

      // Mesclar categorias do banco com as padrão, removendo duplicatas
      const finalCategories = [...new Set([...defaultCategories, ...uniqueCategories])].sort();
      
      console.log('Unified categories fetched:', finalCategories);
      
      return finalCategories;
    },
  });

  return {
    categories,
    isLoading,
    error,
  };
};
