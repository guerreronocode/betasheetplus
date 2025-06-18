
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BillInstallmentDetail {
  id: string;
  description: string;
  purchase_date: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  category?: string;
}

export const useBillDetails = (creditCardId: string, billMonth: string) => {
  const {
    data: installments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['bill-details', creditCardId, billMonth],
    queryFn: async () => {
      console.log('Fetching bill details for:', { creditCardId, billMonth });
      
      const { data, error } = await supabase
        .from('credit_card_installments')
        .select(`
          id,
          installment_number,
          amount,
          credit_card_purchases!inner(
            description,
            purchase_date,
            installments,
            category
          )
        `)
        .eq('credit_card_id', creditCardId)
        .eq('bill_month', billMonth)
        .order('installment_number', { ascending: true });

      if (error) {
        console.error('Error fetching bill details:', error);
        throw error;
      }

      // Transformar os dados para o formato desejado
      const details: BillInstallmentDetail[] = data.map((item: any) => ({
        id: item.id,
        description: item.credit_card_purchases.description,
        purchase_date: item.credit_card_purchases.purchase_date,
        installment_number: item.installment_number,
        total_installments: item.credit_card_purchases.installments,
        amount: item.amount,
        category: item.credit_card_purchases.category,
      }));

      console.log('Bill details processed:', details);
      return details;
    },
    enabled: !!creditCardId && !!billMonth,
  });

  return {
    installments,
    isLoading,
    error,
  };
};
