
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recurringTransactions = [], isLoading: recurringLoading } = useQuery({
    queryKey: ['recurring_transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });

  const addRecurringTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<RecurringTransaction, 'id' | 'is_active'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{ ...transaction, user_id: user.id, is_active: true }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Transação recorrente criada com sucesso!' });
    },
  });

  return {
    recurringTransactions,
    recurringLoading,
    addRecurringTransaction: addRecurringTransactionMutation.mutate,
    isAddingRecurring: addRecurringTransactionMutation.isPending,
  };
};
