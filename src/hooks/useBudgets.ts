
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Budget {
  id: string;
  user_id: string;
  period_type: 'monthly' | 'yearly';
  period_date: string;
  total_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  budget_categories?: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category: string;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetComparison {
  category: string;
  planned: number;
  actual: number;
  difference: number;
  percentage: number;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const getCurrentYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  };

  // Buscar orçamentos
  const {
    data: budgets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_categories (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('period_date', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  // Buscar orçamento mensal atual
  const monthlyBudget = budgets.find(
    b => b.period_type === 'monthly' && b.period_date === getCurrentMonth()
  );

  // Buscar orçamento anual atual
  const yearlyBudget = budgets.find(
    b => b.period_type === 'yearly' && b.period_date === getCurrentYear()
  );

  // Criar orçamento
  const createBudgetMutation = useMutation({
    mutationFn: async (newBudget: {
      period_type: 'monthly' | 'yearly';
      period_date: string;
      total_amount?: number;
      categories?: { category: string; planned_amount: number }[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Primeiro, criar o orçamento principal
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          period_type: newBudget.period_type,
          period_date: newBudget.period_date,
          total_amount: newBudget.total_amount,
        })
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Se há categorias, criar os registros de categoria
      if (newBudget.categories && newBudget.categories.length > 0) {
        const categoryInserts = newBudget.categories.map(cat => ({
          budget_id: budget.id,
          category: cat.category,
          planned_amount: cat.planned_amount,
        }));

        const { error: categoriesError } = await supabase
          .from('budget_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }

      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  // Atualizar orçamento
  const updateBudgetMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
      categories
    }: {
      id: string;
      updates: Partial<Budget>;
      categories?: { category: string; planned_amount: number }[];
    }) => {
      // Atualizar orçamento principal
      const { error: budgetError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id);

      if (budgetError) throw budgetError;

      // Se há categorias, remover as antigas e criar as novas
      if (categories) {
        await supabase
          .from('budget_categories')
          .delete()
          .eq('budget_id', id);

        if (categories.length > 0) {
          const categoryInserts = categories.map(cat => ({
            budget_id: id,
            category: cat.category,
            planned_amount: cat.planned_amount,
          }));

          const { error: categoriesError } = await supabase
            .from('budget_categories')
            .insert(categoryInserts);

          if (categoriesError) throw categoriesError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  // Desativar orçamento
  const deactivateBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  // Calcular comparativo de orçamento
  const getBudgetComparison = async (
    budget: Budget,
    periodStart: string,
    periodEnd: string
  ): Promise<BudgetComparison[]> => {
    if (!user) return [];

    const comparisons: BudgetComparison[] = [];

    // Se há categorias específicas, calcular para cada uma
    if (budget.budget_categories && budget.budget_categories.length > 0) {
      for (const category of budget.budget_categories) {
        const { data: actualSpending } = await supabase.rpc('calculate_actual_spending', {
          p_user_id: user.id,
          p_period_start: periodStart,
          p_period_end: periodEnd,
          p_category: category.category
        });

        const actual = actualSpending || 0;
        const planned = category.planned_amount;
        const difference = planned - actual;
        const percentage = planned > 0 ? (actual / planned) * 100 : 0;

        comparisons.push({
          category: category.category,
          planned,
          actual,
          difference,
          percentage
        });
      }
    } else if (budget.total_amount) {
      // Se só há valor total, calcular geral
      const { data: actualSpending } = await supabase.rpc('calculate_actual_spending', {
        p_user_id: user.id,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

      const actual = actualSpending || 0;
      const planned = budget.total_amount;
      const difference = planned - actual;
      const percentage = planned > 0 ? (actual / planned) * 100 : 0;

      comparisons.push({
        category: 'Geral',
        planned,
        actual,
        difference,
        percentage
      });
    }

    return comparisons;
  };

  return {
    budgets,
    monthlyBudget,
    yearlyBudget,
    isLoading,
    error,
    createBudget: createBudgetMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    deactivateBudget: deactivateBudgetMutation.mutate,
    getBudgetComparison,
    isCreating: createBudgetMutation.isPending,
    isUpdating: updateBudgetMutation.isPending,
    isDeactivating: deactivateBudgetMutation.isPending,
  };
};
