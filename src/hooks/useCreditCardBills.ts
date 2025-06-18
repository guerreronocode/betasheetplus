
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreditCardBill {
  id: string;
  user_id: string;
  credit_card_id: string;
  bill_month: string;
  total_amount: number;
  closing_date: string;
  due_date: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  credit_cards?: {
    name: string;
  };
}

export const useCreditCardBills = () => {
  const {
    data: bills = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-bills'],
    queryFn: async () => {
      console.log('Fetching credit card bills...');
      const { data, error } = await supabase
        .from('credit_card_bills')
        .select(`
          *,
          credit_cards(name)
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }

      console.log('Bills fetched:', data);
      return data as CreditCardBill[];
    },
  });

  const upcomingBills = bills.filter(bill => 
    !bill.is_paid && new Date(bill.due_date) >= new Date()
  );

  const overdueBills = bills.filter(bill => 
    !bill.is_paid && new Date(bill.due_date) < new Date()
  );

  return {
    bills,
    upcomingBills,
    overdueBills,
    isLoading,
    error,
  };
};
