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

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('investment_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-logs'] });
      toast.success('Log excluído com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting investment log:', error);
      toast.error('Erro ao excluir log');
    },
  });

  return {
    logs,
    isLoading,
    createLog: createLogMutation.mutateAsync,
    deleteLog: deleteLogMutation.mutateAsync,
    isCreatingLog: createLogMutation.isPending,
    isDeletingLog: deleteLogMutation.isPending,
  };
};
