
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreditCardPurchase {
  id: string;
  user_id: string;
  credit_card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  installments: number;
  created_at: string;
  updated_at: string;
}

interface PurchaseFormData {
  credit_card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  installments: number;
}

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

      const { data, error } = await supabase
        .from('credit_card_purchases')
        .insert({
          ...purchaseData,
          user_id: user.id,
        })
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

  return {
    purchases,
    isLoading,
    error,
    createPurchase: createPurchase.mutate,
    isCreating: createPurchase.isPending,
  };
};
