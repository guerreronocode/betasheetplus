import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InvestmentLog {
  id: string;
  user_id: string;
  investment_id: string;
  operation_type: 'aport' | 'withdraw' | 'update_value';
  amount: number;
  previous_value: number | null;
  new_value: number | null;
  month_date: string;
  bank_account_id: string | null;
  notes: string | null;
  created_at: string;
}

export const useInvestmentLogs = (investmentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['investment-logs', user?.id, investmentId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('investment_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentId) {
        query = query.eq('investment_id', investmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InvestmentLog[];
    },
    enabled: !!user,
  });

  const createLogMutation = useMutation({
    mutationFn: async (log: Omit<InvestmentLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investment_logs')
        .insert({
          ...log,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-logs'] });
    },
    onError: (error) => {
      console.error('Error creating investment log:', error);
      toast.error('Erro ao registrar log do investimento');
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: async ({ logId, data }: { logId: string; data: Partial<InvestmentLog> }) => {
      if (!user) throw new Error('User not authenticated');

      // Buscar o log original
      const { data: originalLog, error: fetchError } = await supabase
        .from('investment_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (fetchError) throw fetchError;

      const amountDiff = data.amount ? data.amount - originalLog.amount : 0;

      // Atualizar o log
      const { error: updateError } = await supabase
        .from('investment_logs')
        .update(data)
        .eq('id', logId);

      if (updateError) throw updateError;

      // Se o valor mudou, ajustar investimento e valores mensais
      if (amountDiff !== 0) {
        // Buscar investimento atual
        const { data: investment, error: invError } = await supabase
          .from('investments')
          .select('amount')
          .eq('id', originalLog.investment_id)
          .single();

        if (invError) throw invError;

        // Atualizar valor aplicado do investimento
        const newAmount = originalLog.operation_type === 'aport'
          ? investment.amount + amountDiff
          : investment.amount - amountDiff;

        await supabase
          .from('investments')
          .update({ amount: newAmount })
          .eq('id', originalLog.investment_id);

        // Atualizar valor mensal
        const { data: monthlyValue } = await supabase
          .from('investment_monthly_values')
          .select('*')
          .eq('investment_id', originalLog.investment_id)
          .eq('month_date', originalLog.month_date)
          .maybeSingle();

        if (monthlyValue) {
          const newAppliedValue = originalLog.operation_type === 'aport'
            ? monthlyValue.applied_value + amountDiff
            : monthlyValue.applied_value - amountDiff;

          await supabase
            .from('investment_monthly_values')
            .update({ applied_value: newAppliedValue })
            .eq('id', monthlyValue.id);
        }

        // Ajustar conta bancária se houver
        if (originalLog.bank_account_id) {
          const { data: account, error: accError } = await supabase
            .from('bank_accounts')
            .select('balance')
            .eq('id', originalLog.bank_account_id)
            .single();

          if (accError) throw accError;

          const balanceAdjust = originalLog.operation_type === 'aport' ? -amountDiff : amountDiff;

          await supabase
            .from('bank_accounts')
            .update({ balance: account.balance + balanceAdjust })
            .eq('id', originalLog.bank_account_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-logs'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast.success('Operação atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating investment log:', error);
      toast.error('Erro ao atualizar operação');
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Buscar o log antes de deletar
      const { data: log, error: fetchError } = await supabase
        .from('investment_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (fetchError) throw fetchError;

      // Reverter operação no investimento
      const { data: investment, error: invError } = await supabase
        .from('investments')
        .select('amount')
        .eq('id', log.investment_id)
        .single();

      if (invError) throw invError;

      const newAmount = log.operation_type === 'aport'
        ? investment.amount - log.amount
        : investment.amount + log.amount;

      await supabase
        .from('investments')
        .update({ amount: newAmount })
        .eq('id', log.investment_id);

      // Reverter no valor mensal
      const { data: monthlyValue } = await supabase
        .from('investment_monthly_values')
        .select('*')
        .eq('investment_id', log.investment_id)
        .eq('month_date', log.month_date)
        .maybeSingle();

      if (monthlyValue) {
        const newAppliedValue = log.operation_type === 'aport'
          ? monthlyValue.applied_value - log.amount
          : monthlyValue.applied_value + log.amount;

        await supabase
          .from('investment_monthly_values')
          .update({ applied_value: newAppliedValue })
          .eq('id', monthlyValue.id);
      }

      // Reverter na conta bancária se houver
      if (log.bank_account_id) {
        const { data: account, error: accError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', log.bank_account_id)
          .single();

        if (accError) throw accError;

        const balanceAdjust = log.operation_type === 'aport' ? log.amount : -log.amount;

        await supabase
          .from('bank_accounts')
          .update({ balance: account.balance + balanceAdjust })
          .eq('id', log.bank_account_id);
      }

      // Deletar o log
      const { error } = await supabase
        .from('investment_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-logs'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast.success('Operação excluída com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting investment log:', error);
      toast.error('Erro ao excluir operação');
    },
  });

  return {
    logs,
    isLoading,
    createLog: createLogMutation.mutateAsync,
    updateLog: updateLogMutation.mutateAsync,
    deleteLog: deleteLogMutation.mutateAsync,
    isCreatingLog: createLogMutation.isPending,
    isUpdatingLog: updateLogMutation.isPending,
    isDeletingLog: deleteLogMutation.isPending,
  };
};
