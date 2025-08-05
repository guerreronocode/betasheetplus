import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PlannedExpense {
  id: string;
  user_id: string;
  month: string;
  planned_amount: number;
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
  description?: string;
  category: string;
}

export interface PlannedExpenseInput {
  month: string;
  planned_amount: number;
  is_recurring: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
  description?: string;
  category: string;
}

export const usePlannedExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plannedExpenses = [], isLoading } = useQuery({
    queryKey: ['planned_expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('planned_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true });
      
      if (error) throw error;
      return data as PlannedExpense[];
    },
    enabled: !!user,
  });

  const createPlannedExpenseMutation = useMutation({
    mutationFn: async (expense: PlannedExpenseInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('planned_expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_expenses'] });
      toast({
        title: 'Despesa planejada criada com sucesso!',
        description: 'A despesa foi adicionada à sua projeção financeira.',
      });
    },
    onError: (error) => {
      console.error('Erro ao criar despesa planejada:', error);
      toast({
        title: 'Erro ao criar despesa planejada',
        description: 'Ocorreu um erro ao tentar criar a despesa planejada.',
        variant: 'destructive',
      });
    },
  });

  const updatePlannedExpenseMutation = useMutation({
    mutationFn: async ({ id, ...expense }: PlannedExpenseInput & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('planned_expenses')
        .update(expense)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_expenses'] });
      toast({
        title: 'Despesa planejada atualizada com sucesso!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa planejada:', error);
      toast({
        title: 'Erro ao atualizar despesa planejada',
        description: 'Ocorreu um erro ao tentar atualizar a despesa planejada.',
        variant: 'destructive',
      });
    },
  });

  const deletePlannedExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('planned_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_expenses'] });
      toast({
        title: 'Despesa planejada removida com sucesso!',
        description: 'A despesa foi removida da sua projeção financeira.',
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar despesa planejada:', error);
      toast({
        title: 'Erro ao remover despesa planejada',
        description: 'Ocorreu um erro ao tentar remover a despesa planejada.',
        variant: 'destructive',
      });
    },
  });

  return {
    plannedExpenses,
    isLoading,
    createPlannedExpense: createPlannedExpenseMutation.mutate,
    updatePlannedExpense: updatePlannedExpenseMutation.mutate,
    deletePlannedExpense: deletePlannedExpenseMutation.mutate,
    isCreating: createPlannedExpenseMutation.isPending,
    isUpdating: updatePlannedExpenseMutation.isPending,
    isDeleting: deletePlannedExpenseMutation.isPending,
  };
};