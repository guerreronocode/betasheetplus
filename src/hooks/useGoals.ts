import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  completed: boolean;
  color: string;
  linked_investment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
  color?: string;
  linked_investment_id?: string;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  id: string;
  completed?: boolean;
}

export const useGoals = () => {
  const queryClient = useQueryClient();

  // Buscar metas do usuário
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        throw error;
      }
      
      return data as Goal[];
    },
  });

  // Criar nova meta
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          current_amount: goalData.current_amount || 0,
          color: goalData.color || 'blue',
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta. Tente novamente.');
    },
  });

  // Atualizar meta
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...goalData }: UpdateGoalData) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta. Tente novamente.');
    },
  });

  // Deletar meta
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('Erro ao deletar meta:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta removida com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar meta:', error);
      toast.error('Erro ao remover meta. Tente novamente.');
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    isCreatingGoal: createGoalMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
    isDeletingGoal: deleteGoalMutation.isPending,
  };
};