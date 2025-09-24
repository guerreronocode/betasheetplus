import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCardBill } from '@/types/creditCard';

export const useCreditCardBillsByCard = (creditCardId?: string) => {
  const { user } = useAuth();

  const {
    data: bills = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-bills-by-card', creditCardId],
    queryFn: async () => {
      if (!user || !creditCardId) return [];

      const { data: rawBills, error } = await supabase
        .from('credit_card_bills')
        .select(`
          *,
          credit_cards!inner(
            name,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('credit_card_id', creditCardId)
        .eq('credit_cards.is_active', true)
        .order('bill_month', { ascending: false });

      if (error) {
        console.error('Error fetching bills by card:', error);
        throw error;
      }

      const billsWithCorrectValues = [];
      
      for (const bill of rawBills || []) {
        const { data: installments, error: installmentsError } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('credit_card_id', bill.credit_card_id)
          .eq('bill_month', bill.bill_month);

        if (installmentsError) {
          console.error('Error fetching installments for bill:', bill.id, installmentsError);
          continue;
        }

        const correctBillAmount = installments?.reduce((sum, inst) => sum + Number(inst.amount), 0) || 0;

        if ((installments && installments.length > 0) || bill.is_paid) {
          billsWithCorrectValues.push({
            ...bill,
            total_amount: correctBillAmount
          });
        }
      }

      return billsWithCorrectValues as CreditCardBill[];
    },
    enabled: !!user && !!creditCardId,
  });

  return {
    bills,
    isLoading,
    error,
  };
};