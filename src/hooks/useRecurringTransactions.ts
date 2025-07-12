
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';

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
      
      if (error) {
        console.error('Error fetching recurring transactions:', error);
        throw error;
      }
      
      return (data || []).map(item => ({
        ...item,
        type: item.type as 'income' | 'expense',
        frequency: item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
      }));
    },
    enabled: !!user,
  });

  // Função para gerar transações retroativas
  const generateRetroactiveTransactions = async (recurringTransaction: RecurringTransaction) => {
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date(recurringTransaction.start_date);
    const currentDate = new Date();
    const transactions: Array<{ description: string; amount: number; category: string; date: string; user_id: string; }> = [];

    let nextDate = new Date(startDate);
    
    while (isBefore(nextDate, currentDate)) {
      transactions.push({
        description: recurringTransaction.description,
        amount: recurringTransaction.amount,
        category: recurringTransaction.category,
        date: nextDate.toISOString().split('T')[0],
        user_id: user.id,
      });

      // Calcular próxima data baseada na frequência
      switch (recurringTransaction.frequency) {
        case 'daily':
          nextDate = addDays(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
      }
    }

    if (transactions.length > 0) {
      const tableName = recurringTransaction.type === 'income' ? 'income' : 'expenses';
      const { error } = await supabase
        .from(tableName)
        .insert(transactions);

      if (error) {
        console.error('Error creating retroactive transactions:', error);
        throw error;
      }
    }

    return transactions.length;
  };

  const addRecurringTransactionMutation = useMutation({
    mutationFn: async (data: { transaction: Omit<RecurringTransaction, 'id' | 'is_active'>; generateRetroactive?: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: newTransaction, error } = await supabase
        .from('recurring_transactions')
        .insert([{ 
          ...data.transaction, 
          user_id: user.id, 
          is_active: true,
          end_date: data.transaction.end_date || null 
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating recurring transaction:', error);
        throw error;
      }

      // Se solicitado, gerar transações retroativas
      if (data.generateRetroactive && newTransaction) {
        const recurringTx: RecurringTransaction = {
          ...newTransaction,
          type: newTransaction.type as 'income' | 'expense',
          frequency: newTransaction.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
        };
        const count = await generateRetroactiveTransactions(recurringTx);
        return { transaction: newTransaction, retroactiveCount: count };
      }

      return { transaction: newTransaction, retroactiveCount: 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      const message = result.retroactiveCount > 0 
        ? `Transação recorrente criada! ${result.retroactiveCount} lançamentos retroativos adicionados.`
        : 'Transação recorrente criada com sucesso!';
      
      toast({ title: message });
    },
    onError: (error) => {
      console.error('Error in addRecurringTransaction:', error);
      toast({ 
        title: 'Erro ao criar transação recorrente', 
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    },
  });

  const updateRecurringTransactionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<RecurringTransaction> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: updatedTransaction, error } = await supabase
        .from('recurring_transactions')
        .update(data.updates)
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recurring transaction:', error);
        throw error;
      }

      return updatedTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Transação recorrente atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error('Error updating recurring transaction:', error);
      toast({ 
        title: 'Erro ao atualizar transação recorrente', 
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    },
  });

  const deleteRecurringTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting recurring transaction:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Transação recorrente excluída com sucesso!' });
    },
    onError: (error) => {
      console.error('Error deleting recurring transaction:', error);
      toast({ 
        title: 'Erro ao excluir transação recorrente', 
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    },
  });

  return {
    recurringTransactions,
    recurringLoading,
    addRecurringTransaction: addRecurringTransactionMutation.mutate,
    updateRecurringTransaction: updateRecurringTransactionMutation.mutate,
    deleteRecurringTransaction: deleteRecurringTransactionMutation.mutate,
    isAddingRecurring: addRecurringTransactionMutation.isPending,
    isUpdatingRecurring: updateRecurringTransactionMutation.isPending,
    isDeletingRecurring: deleteRecurringTransactionMutation.isPending,
  };
};
