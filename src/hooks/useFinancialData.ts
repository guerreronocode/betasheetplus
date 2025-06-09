
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface IncomeEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  completed: boolean;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Income queries and mutations
  const { data: income = [], isLoading: incomeLoading } = useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as IncomeEntry[];
    },
    enabled: !!user,
  });

  const addIncomeMutation = useMutation({
    mutationFn: async (income: Omit<IncomeEntry, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('income')
        .insert([{ ...income, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast({ title: 'Receita adicionada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar receita', description: error.message, variant: 'destructive' });
    },
  });

  // Expenses queries and mutations
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as ExpenseEntry[];
    },
    enabled: !!user,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<ExpenseEntry, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Despesa adicionada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar despesa', description: error.message, variant: 'destructive' });
    },
  });

  // Investments queries and mutations
  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user,
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async (investment: Omit<Investment, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Investimento adicionado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar investimento', description: error.message, variant: 'destructive' });
    },
  });

  // Goals queries and mutations
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, current_amount }: { id: string; current_amount: number }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar meta', description: error.message, variant: 'destructive' });
    },
  });

  return {
    income,
    expenses,
    investments,
    goals,
    isLoading: incomeLoading || expensesLoading || investmentsLoading || goalsLoading,
    addIncome: addIncomeMutation.mutate,
    addExpense: addExpenseMutation.mutate,
    addInvestment: addInvestmentMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    isAddingIncome: addIncomeMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isAddingInvestment: addInvestmentMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
  };
};
