import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount?: number; // Calculated from linked assets
  deadline?: string;
  completed: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface GoalLink {
  id: string;
  goal_id: string;
  user_id: string;
  link_type: 'vault' | 'investment';
  vault_id?: string;
  investment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  target_amount: number;
  deadline?: string;
  color?: string;
  linkedVaults?: string[];
  linkedInvestments?: string[];
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  id: string;
  completed?: boolean;
}

export const useGoals = () => {
  const queryClient = useQueryClient();

  // Buscar metas do usuário com links e calcular current_amount
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      // Buscar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (goalsError) {
        console.error('Erro ao buscar metas:', goalsError);
        throw goalsError;
      }

      // Buscar links das metas
      const { data: linksData, error: linksError } = await supabase
        .from('goal_links')
        .select(`
          *,
          bank_account_vaults(reserved_amount),
          investments(current_value)
        `);
      
      if (linksError) {
        console.error('Erro ao buscar links das metas:', linksError);
        throw linksError;
      }

      // Calcular current_amount para cada meta
      const goalsWithCurrentAmount = goalsData.map(goal => {
        const goalLinks = linksData.filter(link => link.goal_id === goal.id);
        
        const current_amount = goalLinks.reduce((total, link) => {
          if (link.link_type === 'vault' && link.bank_account_vaults) {
            return total + (link.bank_account_vaults.reserved_amount || 0);
          } else if (link.link_type === 'investment' && link.investments) {
            return total + (link.investments.current_value || 0);
          }
          return total;
        }, 0);

        return {
          ...goal,
          current_amount
        };
      });
      
      return goalsWithCurrentAmount as Goal[];
    },
  });

  // Criar nova meta com links
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar a meta
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          title: goalData.title,
          target_amount: goalData.target_amount,
          deadline: goalData.deadline,
          color: goalData.color || '#3B82F6',
          completed: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (goalError) {
        console.error('Erro ao criar meta:', goalError);
        throw goalError;
      }

      // Criar links para cofres
      if (goalData.linkedVaults && goalData.linkedVaults.length > 0) {
        const vaultLinks = goalData.linkedVaults.map(vaultId => ({
          goal_id: goal.id,
          user_id: user.id,
          link_type: 'vault' as const,
          vault_id: vaultId,
        }));

        const { error: vaultLinksError } = await supabase
          .from('goal_links')
          .insert(vaultLinks);

        if (vaultLinksError) {
          console.error('Erro ao criar links de cofres:', vaultLinksError);
          throw vaultLinksError;
        }
      }

      // Criar links para investimentos
      if (goalData.linkedInvestments && goalData.linkedInvestments.length > 0) {
        const investmentLinks = goalData.linkedInvestments.map(investmentId => ({
          goal_id: goal.id,
          user_id: user.id,
          link_type: 'investment' as const,
          investment_id: investmentId,
        }));

        const { error: investmentLinksError } = await supabase
          .from('goal_links')
          .insert(investmentLinks);

        if (investmentLinksError) {
          console.error('Erro ao criar links de investimentos:', investmentLinksError);
          throw investmentLinksError;
        }
      }

      return goal;
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

  // Atualizar meta com links
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, linkedVaults, linkedInvestments, ...goalData }: UpdateGoalData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar a meta
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .update({
          title: goalData.title,
          target_amount: goalData.target_amount,
          deadline: goalData.deadline,
          color: goalData.color,
          completed: goalData.completed,
        })
        .eq('id', id)
        .select()
        .single();

      if (goalError) {
        console.error('Erro ao atualizar meta:', goalError);
        throw goalError;
      }

      // Atualizar links se fornecidos
      if (linkedVaults !== undefined || linkedInvestments !== undefined) {
        // Remover links existentes
        const { error: deleteError } = await supabase
          .from('goal_links')
          .delete()
          .eq('goal_id', id);

        if (deleteError) {
          console.error('Erro ao remover links existentes:', deleteError);
          throw deleteError;
        }

        // Criar novos links para cofres
        if (linkedVaults && linkedVaults.length > 0) {
          const vaultLinks = linkedVaults.map(vaultId => ({
            goal_id: id,
            user_id: user.id,
            link_type: 'vault' as const,
            vault_id: vaultId,
          }));

          const { error: vaultLinksError } = await supabase
            .from('goal_links')
            .insert(vaultLinks);

          if (vaultLinksError) {
            console.error('Erro ao criar links de cofres:', vaultLinksError);
            throw vaultLinksError;
          }
        }

        // Criar novos links para investimentos
        if (linkedInvestments && linkedInvestments.length > 0) {
          const investmentLinks = linkedInvestments.map(investmentId => ({
            goal_id: id,
            user_id: user.id,
            link_type: 'investment' as const,
            investment_id: investmentId,
          }));

          const { error: investmentLinksError } = await supabase
            .from('goal_links')
            .insert(investmentLinks);

          if (investmentLinksError) {
            console.error('Erro ao criar links de investimentos:', investmentLinksError);
            throw investmentLinksError;
          }
        }
      }

      return goal;
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