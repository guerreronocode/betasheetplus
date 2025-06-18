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
  isCreditCard?: boolean; // Flag para identificar dívidas de cartão
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

  // Liabilities queries and mutations - SEMPRE sincronizar dívidas de cartão antes de buscar
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ['liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // CRÍTICO: Sincronizar dívidas de cartão APENAS de cartões ATIVOS antes de buscar os passivos
      console.log('Sincronizando dívidas de cartão ATIVOS antes de buscar passivos...');
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização automática de dívidas:', syncError);
        // Não falhar a query, apenas logar o erro
      } else {
        console.log('Dívidas de cartão ATIVOS sincronizadas com sucesso');
      }
      
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Marcar as dívidas de cartão de crédito
      const liabilitiesWithFlags = data.map(liability => ({
        ...liability,
        isCreditCard: liability.category === 'cartao_credito'
      }));
      
      console.log('Passivos carregados após sincronização (APENAS cartões ativos):', liabilitiesWithFlags);
      return liabilitiesWithFlags as Liability[];
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

  // Função para sincronizar dívidas de cartão de crédito OBRIGATORIAMENTE (APENAS ATIVOS)
  const syncCreditCardDebts = useMutation({
    mutationFn: async () => {
      console.log('Executando sincronização OBRIGATÓRIA de dívidas de cartão de crédito ATIVOS...');
      const { error } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      
      if (error) {
        console.error('Erro CRÍTICO na sincronização de dívidas de cartão:', error);
        throw error;
      }
      
      console.log('Sincronização obrigatória de dívidas de cartões ATIVOS concluída');
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      console.log('Sincronização de dívidas de cartão ATIVOS concluída com sucesso - UI atualizada');
    },
    onError: (error) => {
      console.error('Erro CRÍTICO na sincronização de dívidas de cartão:', error);
      toast({
        title: "Erro crítico na sincronização",
        description: "Não foi possível sincronizar as dívidas do cartão de crédito. Isso compromete a integridade do patrimônio.",
        variant: "destructive",
      });
    },
  });

  // ... keep existing code (addAssetMutation, updateAssetMutation, deleteAssetMutation) the same

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
      
      // Não permitir criação manual de dívidas de cartão
      if (liability.category === 'cartao_credito') {
        throw new Error('Dívidas de cartão de crédito são criadas automaticamente pelo sistema');
      }
      
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
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar passivo",
        description: error.message || "Não foi possível adicionar o passivo.",
        variant: "destructive",
      });
    },
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, ...liabilityData }: { id: string } & Partial<Liability>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Impedir edição de dívidas de cartão de crédito
      const liability = liabilities.find(l => l.id === id);
      if (liability?.isCreditCard) {
        throw new Error('Dívidas de cartão de crédito são atualizadas automaticamente');
      }
      
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
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar passivo",
        description: error.message || "Não foi possível atualizar o passivo.",
        variant: "destructive",
      });
    },
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: async (liabilityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Impedir exclusão de dívidas de cartão de crédito
      const liability = liabilities.find(l => l.id === liabilityId);
      if (liability?.isCreditCard) {
        throw new Error('Dívidas de cartão de crédito não podem ser removidas manualmente');
      }
      
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
    onError: (error: any) => {
      toast({
        title: "Erro ao remover passivo",
        description: error.message || "Não foi possível remover o passivo.",
        variant: "destructive",
      });
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
    syncCreditCardDebts: syncCreditCardDebts.mutate,
    isAddingAsset: addAssetMutation.isPending,
    isAddingLiability: addLiabilityMutation.isPending,
    isSyncingCreditCardDebts: syncCreditCardDebts.isPending,
    totalAssets,
    totalLiabilities,
    totalDebts,
  };
};
