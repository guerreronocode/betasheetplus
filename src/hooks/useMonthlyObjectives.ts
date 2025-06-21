
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyObjective {
  id: string;
  user_id: string;
  month: string;
  objective_type: 'custom' | 'suggested';
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  target_percentage?: number;
  current_percentage: number;
  calculation_type: 'value' | 'percentage' | 'boolean';
  status: 'not_started' | 'in_progress' | 'completed';
  category?: string;
  related_data?: any;
  is_active: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useMonthlyObjectives = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obter primeiro dia do mês atual
  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const {
    data: objectives = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['monthly-objectives', user?.id, getCurrentMonth()],
    queryFn: async () => {
      if (!user) return [];

      console.log('Buscando objetivos mensais...');

      const { data, error } = await supabase
        .from('monthly_objectives')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', getCurrentMonth())
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar objetivos:', error);
        throw error;
      }

      return data as MonthlyObjective[];
    },
    enabled: !!user,
  });

  const createObjectiveMutation = useMutation({
    mutationFn: async (newObjective: Omit<MonthlyObjective, 'id' | 'user_id' | 'current_value' | 'current_percentage' | 'status' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('monthly_objectives')
        .insert({
          ...newObjective,
          user_id: user.id,
          month: getCurrentMonth(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-objectives'] });
    },
  });

  const updateObjectiveMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MonthlyObjective> }) => {
      const { data, error } = await supabase
        .from('monthly_objectives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-objectives'] });
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('monthly_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-objectives'] });
    },
  });

  const refreshProgressMutation = useMutation({
    mutationFn: async (objectiveId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('calculate_objective_progress', {
        p_user_id: user.id,
        p_month: getCurrentMonth(),
        p_objective_id: objectiveId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-objectives'] });
    },
  });

  return {
    objectives,
    isLoading,
    error,
    createObjective: createObjectiveMutation.mutate,
    updateObjective: updateObjectiveMutation.mutate,
    deleteObjective: deleteObjectiveMutation.mutate,
    refreshProgress: refreshProgressMutation.mutate,
    canAddMore: objectives.length < 3,
    isCreating: createObjectiveMutation.isPending,
    isUpdating: updateObjectiveMutation.isPending,
    isDeleting: deleteObjectiveMutation.isPending,
  };
};
