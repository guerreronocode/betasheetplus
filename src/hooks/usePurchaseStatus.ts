
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseStatus } from '@/types/creditCard';

export const usePurchaseStatus = (creditCardId?: string) => {
  const {
    data: purchases = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['purchase-status', creditCardId],
    queryFn: async () => {
      console.log('Fetching purchase status...');
      
      let query = supabase
        .from('credit_card_purchases')
        .select(`
          id,
          description,
          amount,
          installments,
          purchase_date,
          category,
          credit_cards!inner(name, is_active),
          credit_card_installments(is_paid)
        `)
        .eq('credit_cards.is_active', true)
        .order('purchase_date', { ascending: false });

      if (creditCardId) {
        query = query.eq('credit_card_id', creditCardId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching purchase status:', error);
        throw error;
      }

      // Transformar dados para o formato desejado
      const purchaseStatus: PurchaseStatus[] = data.map((purchase: any) => {
        const paidInstallments = purchase.credit_card_installments?.filter((inst: any) => inst.is_paid).length || 0;
        const remainingAmount = (purchase.amount / purchase.installments) * (purchase.installments - paidInstallments);
        
        return {
          id: purchase.id,
          description: purchase.description,
          total_amount: purchase.amount,
          installments: purchase.installments,
          paid_installments: paidInstallments,
          remaining_amount: remainingAmount,
          credit_card_name: purchase.credit_cards?.name || 'Cartão',
          credit_card_active: true, // Agora sempre true pois filtramos apenas ativos
          purchase_date: purchase.purchase_date,
          category: purchase.category,
        };
      });

      console.log('Purchase status processed:', purchaseStatus);
      return purchaseStatus;
    },
  });

  return {
    purchases,
    isLoading,
    error,
  };
};
