import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PlannedIncome {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-DD format (first day of month)
  category: string;
  planned_amount: number;
  description?: string;
  is_recurring: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
  created_at: string;
  updated_at: string;
}

export interface PlannedIncomeInput {
  month: string;
  category: string;
  planned_amount: number;
  description?: string;
  is_recurring?: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
}

export const usePlannedIncome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plannedIncome = [], isLoading } = useQuery({
    queryKey: ['planned_income', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('planned_income')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false });

      if (error) throw error;
      return data as PlannedIncome[];
    },
    enabled: !!user,
  });

  const createPlannedIncomeMutation = useMutation({
    mutationFn: async (plannedIncome: PlannedIncomeInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('planned_income')
        .insert([{ ...plannedIncome, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_income'] });
      toast({ title: 'Receita prevista adicionada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao adicionar receita prevista', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const updatePlannedIncomeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PlannedIncomeInput> }) => {
      const { data, error } = await supabase
        .from('planned_income')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_income'] });
      toast({ title: 'Receita prevista atualizada com sucesso!' });
    },
  });

  const deletePlannedIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planned_income')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_income'] });
      toast({ title: 'Receita prevista removida com sucesso!' });
    },
  });

  return {
    plannedIncome,
    isLoading,
    createPlannedIncome: createPlannedIncomeMutation.mutate,
    updatePlannedIncome: updatePlannedIncomeMutation.mutate,
    deletePlannedIncome: deletePlannedIncomeMutation.mutate,
    isCreating: createPlannedIncomeMutation.isPending,
    isUpdating: updatePlannedIncomeMutation.isPending,
    isDeleting: deletePlannedIncomeMutation.isPending,
  };
};