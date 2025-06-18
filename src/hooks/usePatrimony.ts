
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Asset {
  id: string;
  name: string;
  category: string;
  current_value: number;
  purchase_date: string;
  purchase_value?: number;
  description?: string;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment?: number;
  due_date?: string;
  description?: string;
}

export interface Debt {
  id: string;
  creditor: string;
  description: string;
  financed_amount: number;
  total_debt_amount: number;
  remaining_balance: number;
  total_interest_amount: number;
  total_interest_percentage: number;
  installment_value: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue' | 'renegotiated';
  notes?: string;
}

export const usePatrimony = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Assets queries and mutations
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user,
  });

  // Liabilities queries and mutations
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ['liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Liability[];
    },
    enabled: !!user,
  });

  // Debts query
  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user,
  });

  const addAssetMutation = useMutation({
    mutationFn: async (asset: Omit<Asset, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('assets')
        .insert([{ ...asset, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo adicionado com sucesso!' });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, ...assetData }: { id: string } & Partial<Asset>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo atualizado com sucesso!' });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({ title: 'Ativo removido com sucesso!' });
    },
  });

  const addLiabilityMutation = useMutation({
    mutationFn: async (liability: Omit<Liability, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('liabilities')
        .insert([{ ...liability, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({ title: 'Passivo adicionado com sucesso!' });
    },
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, ...liabilityData }: { id: string } & Partial<Liability>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('liabilities')
        .update(liabilityData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({ title: 'Passivo atualizado com sucesso!' });
    },
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: async (liabilityId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('liabilities')
        .delete()
        .eq('id', liabilityId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({ title: 'Passivo removido com sucesso!' });
    },
  });

  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.current_value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.remaining_amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining_balance, 0);

  return {
    assets,
    liabilities,
    debts,
    isLoading: assetsLoading || liabilitiesLoading || debtsLoading,
    addAsset: addAssetMutation.mutate,
    updateAsset: updateAssetMutation.mutate,
    deleteAsset: deleteAssetMutation.mutate,
    addLiability: addLiabilityMutation.mutate,
    updateLiability: updateLiabilityMutation.mutate,
    deleteLiability: deleteLiabilityMutation.mutate,
    isAddingAsset: addAssetMutation.isPending,
    isAddingLiability: addLiabilityMutation.isPending,
    totalAssets,
    totalLiabilities,
    totalDebts,
  };
};
