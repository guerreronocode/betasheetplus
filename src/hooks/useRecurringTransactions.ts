
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
  bank_account_id?: string;
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
    console.log('🔄 Gerando transações retroativas para:', recurringTransaction);
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date(recurringTransaction.start_date + 'T00:00:00');
    const currentDate = new Date();
    const transactions: Array<{ 
      description: string; 
      amount: number; 
      category: string; 
      date: string; 
      user_id: string; 
      bank_account_id?: string; 
      recurring_transaction_id: string; 
    }> = [];

    let nextDate = new Date(startDate);
    
    while (isBefore(nextDate, currentDate)) {
      // Formatar data no formato YYYY-MM-DD sem problemas de timezone
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      transactions.push({
        description: recurringTransaction.description,
        amount: recurringTransaction.amount,
        category: recurringTransaction.category,
        date: dateString,
        user_id: user.id,
        bank_account_id: recurringTransaction.bank_account_id,
        recurring_transaction_id: recurringTransaction.id,
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
      console.log(`💾 Inserindo ${transactions.length} transações na tabela ${recurringTransaction.type === 'income' ? 'income' : 'expenses'}`);
      const tableName = recurringTransaction.type === 'income' ? 'income' : 'expenses';
      const { error } = await supabase
        .from(tableName)
        .insert(transactions);

      if (error) {
        console.error('Error creating retroactive transactions:', error);
        throw error;
      }
      console.log('✅ Transações inseridas com sucesso!');

      // Atualizar saldo da conta bancária se especificada
      if (recurringTransaction.bank_account_id) {
        const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const isIncome = recurringTransaction.type === 'income';
        
        // Buscar saldo atual da conta
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', recurringTransaction.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching account balance:', fetchError);
          throw fetchError;
        }
        
        // Calcular novo saldo
        const newBalance = isIncome 
          ? currentAccount.balance + totalAmount 
          : currentAccount.balance - totalAmount;
        
        // Atualizar saldo
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', recurringTransaction.bank_account_id)
          .eq('user_id', user.id);

        if (balanceError) {
          console.error('Error updating account balance:', balanceError);
          throw balanceError;
        }
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
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
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
      console.log('🗑️ Excluindo transação recorrente:', id);
      if (!user) throw new Error('User not authenticated');

      // Primeiro, buscar as transações geradas automaticamente para reverter o saldo
      console.log('🔍 Buscando transações geradas automaticamente...');
      const { data: generatedIncomes } = await supabase
        .from('income')
        .select('amount, bank_account_id')
        .eq('recurring_transaction_id', id)
        .eq('user_id', user.id);

      const { data: generatedExpenses } = await supabase
        .from('expenses')
        .select('amount, bank_account_id')
        .eq('recurring_transaction_id', id)
        .eq('user_id', user.id);
        
      console.log(`📊 Encontradas: ${generatedIncomes?.length || 0} receitas e ${generatedExpenses?.length || 0} despesas`);

      // Agrupar transações por conta bancária para calcular o impacto
      const accountImpacts = new Map<string, number>();

      // Processar receitas (devem ser subtraídas do saldo)
      generatedIncomes?.forEach(income => {
        if (income.bank_account_id) {
          const current = accountImpacts.get(income.bank_account_id) || 0;
          accountImpacts.set(income.bank_account_id, current - income.amount);
        }
      });

      // Processar despesas (devem ser adicionadas de volta ao saldo)
      generatedExpenses?.forEach(expense => {
        if (expense.bank_account_id) {
          const current = accountImpacts.get(expense.bank_account_id) || 0;
          accountImpacts.set(expense.bank_account_id, current + expense.amount);
        }
      });

      // Atualizar saldos das contas afetadas
      for (const [accountId, impact] of accountImpacts) {
        if (impact !== 0) {
          // Buscar saldo atual
          const { data: currentAccount, error: fetchError } = await supabase
            .from('bank_accounts')
            .select('balance')
            .eq('id', accountId)
            .eq('user_id', user.id)
            .single();

          if (fetchError) {
            console.error('Error fetching account balance:', fetchError);
            continue; // Continuar com as outras contas
          }

          // Atualizar saldo
          const { error: balanceError } = await supabase
            .from('bank_accounts')
            .update({ 
              balance: currentAccount.balance + impact,
              updated_at: new Date().toISOString()
            })
            .eq('id', accountId)
            .eq('user_id', user.id);

          if (balanceError) {
            console.error('Error updating account balance:', balanceError);
          }
        }
      }

      // Excluir transações geradas automaticamente (ON DELETE CASCADE fará isso automaticamente)
      // mas vamos fazer explicitamente para garantir
      await supabase
        .from('income')
        .delete()
        .eq('recurring_transaction_id', id)
        .eq('user_id', user.id);

      await supabase
        .from('expenses')
        .delete()
        .eq('recurring_transaction_id', id)
        .eq('user_id', user.id);

      // Desativar a transação recorrente
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting recurring transaction:', error);
        throw error;
      }

      return { 
        id, 
        deletedIncomes: generatedIncomes?.length || 0,
        deletedExpenses: generatedExpenses?.length || 0 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
      const totalDeleted = result.deletedIncomes + result.deletedExpenses;
      const message = totalDeleted > 0 
        ? `Transação recorrente excluída! ${totalDeleted} lançamentos associados foram removidos.`
        : 'Transação recorrente excluída com sucesso!';
      
      toast({ title: message });
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
