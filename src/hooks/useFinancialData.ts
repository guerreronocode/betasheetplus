
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
  yield_type: 'fixed' | 'cdi' | 'selic' | 'ipca';
  yield_rate: number;
  last_yield_update: string;
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

export interface YieldRate {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
}

export interface AssetPrice {
  id: string;
  symbol: string;
  price: number;
  currency: string;
  last_update: string;
  source: string;
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
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Receita adicionada com sucesso!' });
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
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Despesa adicionada com sucesso!' });
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
      
      // Transform data to match our Investment interface
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        amount: item.amount,
        current_value: item.current_value || item.amount,
        purchase_date: item.purchase_date,
        yield_type: (item as any).yield_type || 'fixed',
        yield_rate: (item as any).yield_rate || 0,
        last_yield_update: (item as any).last_yield_update || item.purchase_date,
      })) as Investment[];
    },
    enabled: !!user,
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async (investment: Omit<Investment, 'id' | 'current_value' | 'last_yield_update'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('investments')
        .insert([{ 
          ...investment, 
          user_id: user.id,
          current_value: investment.amount,
          last_yield_update: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Investimento adicionado com sucesso!' });
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

  const addGoalMutation = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'current_amount' | 'completed'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('goals')
        .insert([{ 
          ...goal, 
          user_id: user.id,
          current_amount: 0,
          completed: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta criada com sucesso!' });
    },
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
  });

  // Yield rates query - using raw SQL to access new table
  const { data: yieldRates = [] } = useQuery({
    queryKey: ['yield_rates'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_yield_rates');
      if (error) {
        console.log('Error fetching yield rates:', error);
        return [];
      }
      return (data || []) as YieldRate[];
    },
  });

  // Asset prices query - using raw SQL to access new table
  const { data: assetPrices = [] } = useQuery({
    queryKey: ['asset_prices'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_asset_prices');
      if (error) {
        console.log('Error fetching asset prices:', error);
        return [];
      }
      return (data || []) as AssetPrice[];
    },
  });

  // Calculate financial metrics
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const currentInvestmentValue = investments.reduce((sum, item) => sum + item.current_value, 0);
  
  // Available balance = Income - Expenses - Invested Amount
  const availableBalance = totalIncome - totalExpenses - totalInvested;
  
  // Net worth = Available balance + Current investment value
  const netWorth = availableBalance + currentInvestmentValue;
  
  // Investment return
  const investmentReturn = currentInvestmentValue - totalInvested;

  return {
    income,
    expenses,
    investments,
    goals,
    yieldRates,
    assetPrices,
    isLoading: incomeLoading || expensesLoading || investmentsLoading || goalsLoading,
    addIncome: addIncomeMutation.mutate,
    addExpense: addExpenseMutation.mutate,
    addInvestment: addInvestmentMutation.mutate,
    addGoal: addGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    isAddingIncome: addIncomeMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isAddingInvestment: addInvestmentMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
    
    // Financial metrics
    totalIncome,
    totalExpenses,
    totalInvested,
    currentInvestmentValue,
    availableBalance,
    netWorth,
    investmentReturn,
  };
};
