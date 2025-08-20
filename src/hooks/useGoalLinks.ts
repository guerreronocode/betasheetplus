import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GoalLink {
  id: string;
  goal_id: string;
  user_id: string;
  link_type: 'vault' | 'investment';
  vault_id?: string;
  investment_id?: string;
  created_at: string;
  updated_at: string;
  bank_account_vaults?: {
    id: string;
    name: string;
    reserved_amount: number;
  };
  investments?: {
    id: string;
    name: string;
    current_value: number;
  };
}

export const useGoalLinks = (goalId?: string) => {
  const { data: goalLinks = [], isLoading, error } = useQuery({
    queryKey: ['goal-links', goalId],
    queryFn: async () => {
      let query = supabase
        .from('goal_links')
        .select(`
          *,
          bank_account_vaults(id, name, reserved_amount),
          investments(id, name, current_value)
        `);
      
      if (goalId) {
        query = query.eq('goal_id', goalId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar links das metas:', error);
        throw error;
      }
      
      return data as GoalLink[];
    },
  });

  return {
    goalLinks,
    isLoading,
    error,
  };
};