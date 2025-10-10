import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InvestmentVault {
  id: string;
  user_id: string;
  investment_id: string;
  name: string;
  description: string | null;
  reserved_amount: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useInvestmentVaults = (investmentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['investment-vaults', user?.id, investmentId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('investment_vaults')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentId) {
        query = query.eq('investment_id', investmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InvestmentVault[];
    },
    enabled: !!user,
  });

  const addVaultMutation = useMutation({
    mutationFn: async (vault: Omit<InvestmentVault, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('investment_vaults')
        .insert({
          ...vault,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-vaults'] });
      toast.success('Cofre criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating vault:', error);
      toast.error('Erro ao criar cofre');
    },
  });

  const updateVaultMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvestmentVault> & { id: string }) => {
      const { data, error } = await supabase
        .from('investment_vaults')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-vaults'] });
      toast.success('Cofre atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating vault:', error);
      toast.error('Erro ao atualizar cofre');
    },
  });

  const deleteVaultMutation = useMutation({
    mutationFn: async (vaultId: string) => {
      const { error } = await supabase
        .from('investment_vaults')
        .delete()
        .eq('id', vaultId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-vaults'] });
      toast.success('Cofre excluído com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting vault:', error);
      toast.error('Erro ao excluir cofre');
    },
  });

  const getTotalReserved = (investmentId: string) => {
    return vaults
      .filter(v => v.investment_id === investmentId)
      .reduce((sum, v) => sum + v.reserved_amount, 0);
  };

  return {
    vaults,
    isLoading,
    addVault: addVaultMutation.mutateAsync,
    updateVault: updateVaultMutation.mutateAsync,
    deleteVault: deleteVaultMutation.mutateAsync,
    getTotalReserved,
    isAddingVault: addVaultMutation.isPending,
    isUpdatingVault: updateVaultMutation.isPending,
    isDeletingVault: deleteVaultMutation.isPending,
  };
};
