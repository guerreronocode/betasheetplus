import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePendingTransactionActions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Efetivar receita planejada (planned_income → income)
  const effectPlannedIncome = useMutation({
    mutationFn: async ({
      plannedIncomeId,
      bankAccountId,
      effectiveDate
    }: {
      plannedIncomeId: string;
      bankAccountId: string;
      effectiveDate: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Buscar dados da receita planejada
      const { data: plannedIncome, error: fetchError } = await supabase
        .from('planned_income')
        .select('*')
        .eq('id', plannedIncomeId)
        .single();

      if (fetchError || !plannedIncome) {
        throw new Error('Receita planejada não encontrada');
      }

      // 2. Criar transação efetivada
      const { error: incomeError } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          amount: plannedIncome.planned_amount,
          date: effectiveDate,
          description: plannedIncome.description || 'Receita planejada',
          category: plannedIncome.category,
          bank_account_id: bankAccountId
        });

      if (incomeError) throw incomeError;

      // 3. Atualizar saldo da conta
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', bankAccountId)
        .single();

      if (account) {
        await supabase
          .from('bank_accounts')
          .update({ balance: account.balance + plannedIncome.planned_amount })
          .eq('id', bankAccountId);
      }

      // 4. Deletar pendência
      const { error: deleteError } = await supabase
        .from('planned_income')
        .delete()
        .eq('id', plannedIncomeId);

      if (deleteError) throw deleteError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['planned_income'] });
      
      toast({
        title: 'Receita efetivada',
        description: 'A receita foi efetivada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao efetivar receita',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Efetivar despesa planejada (planned_expense → expense)
  const effectPlannedExpense = useMutation({
    mutationFn: async ({
      plannedExpenseId,
      bankAccountId,
      effectiveDate
    }: {
      plannedExpenseId: string;
      bankAccountId: string;
      effectiveDate: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Buscar dados da despesa planejada
      const { data: plannedExpense, error: fetchError } = await supabase
        .from('planned_expenses')
        .select('*')
        .eq('id', plannedExpenseId)
        .single();

      if (fetchError || !plannedExpense) {
        throw new Error('Despesa planejada não encontrada');
      }

      // 2. Criar transação efetivada
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: plannedExpense.planned_amount,
          date: effectiveDate,
          description: plannedExpense.description || 'Despesa planejada',
          category: plannedExpense.category,
          bank_account_id: bankAccountId
        });

      if (expenseError) throw expenseError;

      // 3. Atualizar saldo da conta
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', bankAccountId)
        .single();

      if (account) {
        await supabase
          .from('bank_accounts')
          .update({ balance: account.balance - plannedExpense.planned_amount })
          .eq('id', bankAccountId);
      }

      // 4. Deletar pendência
      const { error: deleteError } = await supabase
        .from('planned_expenses')
        .delete()
        .eq('id', plannedExpenseId);

      if (deleteError) throw deleteError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['planned_expenses'] });
      
      toast({
        title: 'Despesa efetivada',
        description: 'A despesa foi efetivada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao efetivar despesa',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    effectPlannedIncome: effectPlannedIncome.mutate,
    effectPlannedExpense: effectPlannedExpense.mutate,
    isEffecting: effectPlannedIncome.isPending || effectPlannedExpense.isPending
  };
};
