
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCardPurchase, PurchaseFormData, PurchaseInsertData } from '@/types/creditCard';

export const useCreditCardPurchases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: purchases = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-purchases'],
    queryFn: async () => {
      console.log('Fetching credit card purchases...');
      const { data, error } = await supabase
        .from('credit_card_purchases')
        .select(`
          *,
          credit_cards!inner(name, is_active)
        `)
        .eq('credit_cards.is_active', true)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Purchases fetched:', data);
      return data as CreditCardPurchase[];
    },
  });

  const createPurchase = useMutation({
    mutationFn: async (purchaseData: PurchaseFormData) => {
      console.log('Creating purchase:', purchaseData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Sempre usar o processo padrão - deixar o trigger processar automaticamente
      // Removemos a lógica de parcelas manuais para evitar conflitos
      const insertData: Omit<PurchaseInsertData, 'manual_installments'> = {
        user_id: user.id,
        credit_card_id: purchaseData.credit_card_id,
        description: purchaseData.description,
        amount: purchaseData.amount,
        purchase_date: purchaseData.purchase_date,
        installments: purchaseData.installments,
        category: purchaseData.category,
      };

      const { data, error } = await supabase
        .from('credit_card_purchases')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        throw error;
      }

      console.log('Purchase created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-installments'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      queryClient.invalidateQueries({ queryKey: ['integrated-categories'] });
      queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
      // Invalidar também queries do patrimônio para atualizar automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      console.log('Compra criada e queries invalidadas para sincronização automática');
      toast({
        title: "Compra registrada!",
        description: "A compra foi adicionada ao cartão de crédito e o patrimônio será atualizado automaticamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating purchase:', error);
      toast({
        title: "Erro ao registrar compra",
        description: "Não foi possível registrar a compra. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updatePurchase = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<CreditCardPurchase> & { id: string }) => {
      console.log('Updating purchase:', id, updateData);
      const { data, error } = await supabase
        .from('credit_card_purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating purchase:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-installments'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      queryClient.invalidateQueries({ queryKey: ['integrated-categories'] });
      queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
      // Invalidar também queries do patrimônio para atualizar automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      console.log('Compra atualizada e queries invalidadas para sincronização automática');
      toast({
        title: "Compra atualizada!",
        description: "As informações da compra foram atualizadas e o patrimônio foi sincronizado.",
      });
    },
    onError: (error) => {
      console.error('Error updating purchase:', error);
      toast({
        title: "Erro ao atualizar compra",
        description: "Não foi possível atualizar a compra.",
        variant: "destructive",
      });
    },
  });

  const deletePurchase = useMutation({
    mutationFn: async (purchaseId: string) => {
      console.log('Deleting purchase:', purchaseId);
      const { error } = await supabase
        .from('credit_card_purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) {
        console.error('Error deleting purchase:', error);
        throw error;
      }

      console.log('Purchase deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-installments'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      queryClient.invalidateQueries({ queryKey: ['integrated-categories'] });
      queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
      // Invalidar também queries do patrimônio para atualizar automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      console.log('Compra removida e queries invalidadas para sincronização automática');
      toast({
        title: "Compra removida!",
        description: "A compra foi removida e o patrimônio foi atualizado automaticamente.",
      });
    },
    onError: (error) => {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Erro ao remover compra",
        description: "Não foi possível remover a compra.",
        variant: "destructive",
      });
    },
  });

  return {
    purchases,
    isLoading,
    error,
    createPurchase: createPurchase.mutate,
    updatePurchase: updatePurchase.mutate,
    deletePurchase: deletePurchase.mutate,
    isCreating: createPurchase.isPending,
    isUpdating: updatePurchase.isPending,
    isDeleting: deletePurchase.isPending,
  };
};
