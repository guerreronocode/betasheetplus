
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
  bank_account_id?: string;
}

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  bank_account_id?: string;
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
  bank_account_id?: string;
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

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: string;
  balance: number;
  color: string;
  is_active: boolean;
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

  // Bank accounts queries and mutations
  const { data: bankAccounts = [], isLoading: bankAccountsLoading } = useQuery({
    queryKey: ['bank_accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user,
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id' | 'is_active'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{ ...account, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast({ title: 'Conta bancária adicionada com sucesso!' });
    },
  });

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
      
      // If bank account is specified, update its balance
      if (income.bank_account_id) {
        // First get the current balance
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', income.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Update the balance
        const newBalance = currentAccount.balance + income.amount;
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', income.bank_account_id)
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;
      }

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
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
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
      
      // If bank account is specified, update its balance
      if (expense.bank_account_id) {
        // First get the current balance
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', expense.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Update the balance
        const newBalance = currentAccount.balance - expense.amount;
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', expense.bank_account_id)
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;
      }

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
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
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
        bank_account_id: (item as any).bank_account_id,
      })) as Investment[];
    },
    enabled: !!user,
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async (investment: Omit<Investment, 'id' | 'current_value' | 'last_yield_update'>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Investment transfers money from available balance to invested amount
      // This doesn't increase net worth, just moves money between categories
      if (investment.bank_account_id) {
        // First get the current balance
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Update the balance
        const newBalance = currentAccount.balance - investment.amount;
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;
      }

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
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
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

  // Yield rates query - using edge function
  const { data: yieldRates = [] } = useQuery({
    queryKey: ['yield_rates'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-yield-rates');
      if (error) {
        console.log('Error fetching yield rates:', error);
        return [];
      }
      return (data || []) as YieldRate[];
    },
  });

  // Asset prices query - using edge function
  const { data: assetPrices = [] } = useQuery({
    queryKey: ['asset_prices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-asset-prices');
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
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Correct net worth calculation: bank balances + current investment value
  const netWorth = totalBankBalance + currentInvestmentValue;
  
  // Available balance is the sum of all bank account balances
  const availableBalance = totalBankBalance;
  
  // Investment return
  const investmentReturn = currentInvestmentValue - totalInvested;

  return {
    income,
    expenses,
    investments,
    goals,
    bankAccounts,
    yieldRates,
    assetPrices,
    isLoading: incomeLoading || expensesLoading || investmentsLoading || goalsLoading || bankAccountsLoading,
    addIncome: addIncomeMutation.mutate,
    addExpense: addExpenseMutation.mutate,
    addInvestment: addInvestmentMutation.mutate,
    addGoal: addGoalMutation.mutate,
    addBankAccount: addBankAccountMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    isAddingIncome: addIncomeMutation.isPending,
    isAddingExpense: addExpenseMutation.isPending,
    isAddingInvestment: addInvestmentMutation.isPending,
    isAddingBankAccount: addBankAccountMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
    
    // Financial metrics with corrected calculations
    totalIncome,
    totalExpenses,
    totalInvested,
    currentInvestmentValue,
    availableBalance,
    netWorth,
    investmentReturn,
  };
};
