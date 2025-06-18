
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
          credit_cards(name)
        `)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Purchases fetched:', data);
      return data;
    },
  });

  const createPurchase = useMutation({
    mutationFn: async (purchaseData: PurchaseFormData) => {
      console.log('Creating purchase:', purchaseData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Converter dados do formulário para dados de inserção
      const insertData: PurchaseInsertData = {
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-installments'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      toast({
        title: "Compra registrada!",
        description: "A compra foi adicionada ao cartão de crédito.",
      });
    },
    onError: (error) => {
      console.error('Error creating purchase:', error);
      toast({
        title: "Erro ao registrar compra",
        description: "Não foi possível registrar a compra.",
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
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      toast({
        title: "Compra atualizada!",
        description: "As informações da compra foram atualizadas.",
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

  return {
    purchases,
    isLoading,
    error,
    createPurchase: createPurchase.mutate,
    updatePurchase: updatePurchase.mutate,
    isCreating: createPurchase.isPending,
    isUpdating: updatePurchase.isPending,
  };
};
