
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

export const useIncome = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    enabled: !!user && !authLoading,
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

  return {
    income,
    incomeLoading: incomeLoading || authLoading,
    addIncome: addIncomeMutation.mutate,
    isAddingIncome: addIncomeMutation.isPending,
  };
};
