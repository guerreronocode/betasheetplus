import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BankAccountVault {
  id: string;
  user_id: string;
  bank_account_id: string;
  name: string;
  reserved_amount: number;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useBankAccountVaults = (bankAccountId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaults = [], isLoading: vaultsLoading } = useQuery({
    queryKey: ['bank_account_vaults', bankAccountId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('bank_account_vaults')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (bankAccountId) {
        query = query.eq('bank_account_id', bankAccountId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BankAccountVault[];
    },
    enabled: !!user,
  });

  const addVaultMutation = useMutation({
    mutationFn: async (vault: Omit<BankAccountVault, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bank_account_vaults')
        .insert([{ ...vault, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_account_vaults'] });
      toast({ title: 'Cofre criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar cofre', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateVaultMutation = useMutation({
    mutationFn: async ({ id, ...vault }: Partial<BankAccountVault> & { id: string }) => {
      const { data, error } = await supabase
        .from('bank_account_vaults')
        .update(vault)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_account_vaults'] });
      toast({ title: 'Cofre atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar cofre', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteVaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_account_vaults')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_account_vaults'] });
      toast({ title: 'Cofre excluído com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir cofre', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Calcular total reservado para uma conta específica
  const getTotalReserved = (bankAccountId: string) => {
    return vaults
      .filter(vault => vault.bank_account_id === bankAccountId)
      .reduce((total, vault) => total + vault.reserved_amount, 0);
  };

  return {
    vaults,
    vaultsLoading,
    addVault: addVaultMutation.mutate,
    updateVault: updateVaultMutation.mutate,
    deleteVault: deleteVaultMutation.mutate,
    isAddingVault: addVaultMutation.isPending,
    isUpdatingVault: updateVaultMutation.isPending,
    isDeletingVault: deleteVaultMutation.isPending,
    getTotalReserved,
  };
};