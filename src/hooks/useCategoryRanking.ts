
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CategoryRankingItem {
  category: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export const useCategoryRanking = () => {
  const { user } = useAuth();

  const {
    data: categoryRanking = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['category-ranking', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Calculando ranking de gastos por categoria...');

      // Buscar gastos de transações manuais
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', user.id);

      if (expensesError) {
        console.error('Erro ao buscar despesas:', expensesError);
        throw expensesError;
      }

      // Buscar gastos de cartões de crédito APENAS de cartões ativos
      const { data: creditCardPurchases, error: purchasesError } = await supabase
        .from('credit_card_purchases')
        .select(`
          category,
          amount,
          credit_cards!inner(is_active)
        `)
        .eq('user_id', user.id)
        .eq('credit_cards.is_active', true);

      if (purchasesError) {
        console.error('Erro ao buscar compras de cartão:', purchasesError);
        throw purchasesError;
      }

      // Combinar e agrupar por categoria
      const categoryTotals = new Map<string, { total: number; count: number }>();

      // Processar despesas manuais
      expenses?.forEach(expense => {
        if (expense.category && expense.category.trim() !== '') {
          const existing = categoryTotals.get(expense.category) || { total: 0, count: 0 };
          categoryTotals.set(expense.category, {
            total: existing.total + Number(expense.amount),
            count: existing.count + 1
          });
        }
      });

      // Processar compras de cartão de crédito
      creditCardPurchases?.forEach(purchase => {
        if (purchase.category && purchase.category.trim() !== '') {
          const existing = categoryTotals.get(purchase.category) || { total: 0, count: 0 };
          categoryTotals.set(purchase.category, {
            total: existing.total + Number(purchase.amount),
            count: existing.count + 1
          });
        }
      });

      // Calcular total geral para porcentagens
      const totalSpent = Array.from(categoryTotals.values())
        .reduce((sum, item) => sum + item.total, 0);

      // Converter para array e calcular porcentagens
      const ranking: CategoryRankingItem[] = Array.from(categoryTotals.entries())
        .map(([category, data]) => ({
          category,
          totalAmount: data.total,
          percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
          transactionCount: data.count
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      console.log('Ranking de categorias calculado:', ranking);
      return ranking;
    },
    enabled: !!user,
  });

  return {
    categoryRanking,
    isLoading,
    error,
  };
};
