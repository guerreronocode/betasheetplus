
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  completed: boolean;
  linked_investment_id?: string | null;
}

export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'current_amount' | 'completed'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('goals')
        .insert([{ 
          ...goal, 
          user_id: user.id,
          current_amount: 0,
          completed: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta criada com sucesso!' });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, current_amount }: { id: string; current_amount: number }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta atualizada com sucesso!' });
    },
  });

  return {
    goals,
    goalsLoading,
    addGoal: addGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    isAddingGoal: addGoalMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
  };
};
