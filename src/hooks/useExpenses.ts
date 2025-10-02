
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  bank_account_id?: string;
}

export const useExpenses = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Only fetch expenses with date <= today (effected transactions)
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const todayStr = today.toISOString().split('T')[0];
      
      console.log('🔍 [useExpenses] Fetching expenses with date <=', todayStr);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .lte('date', todayStr)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      console.log('✅ [useExpenses] Fetched', data?.length || 0, 'effected expenses');
      return data as ExpenseEntry[];
    },
    enabled: !!user && !authLoading,
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

        // Get total reserved amount in vaults for this account
        const { data: vaults, error: vaultsError } = await supabase
          .from('bank_account_vaults')
          .select('reserved_amount')
          .eq('bank_account_id', expense.bank_account_id)
          .eq('user_id', user.id);

        if (vaultsError) throw vaultsError;

        const totalReserved = vaults?.reduce((sum, vault) => sum + vault.reserved_amount, 0) || 0;
        const availableBalance = currentAccount.balance - totalReserved;

        // Check if there's enough available balance (excluding reserved amounts)
        if (availableBalance < expense.amount) {
          throw new Error(
            `Saldo insuficiente. Saldo disponível: R$ ${availableBalance.toFixed(2)} ` +
            `(Saldo total: R$ ${currentAccount.balance.toFixed(2)}, ` +
            `Reservado em cofres: R$ ${totalReserved.toFixed(2)}). ` +
            `Para realizar esta transação, retire primeiro o valor necessário dos cofres.`
          );
        }
        
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
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao adicionar despesa', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    expenses,
    expensesLoading: expensesLoading || authLoading,
    addExpense: addExpenseMutation.mutate,
    isAddingExpense: addExpenseMutation.isPending,
  };
};
