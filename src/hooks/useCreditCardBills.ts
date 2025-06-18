
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCardBill, BillPaymentFormData } from '@/types/creditCard';

export const useCreditCardBills = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const payBill = useMutation({
    mutationFn: async ({ billId, paymentData }: { billId: string; paymentData: BillPaymentFormData }) => {
      console.log('Paying bill:', billId, paymentData);
      
      const { data, error } = await supabase
        .from('credit_card_bills')
        .update({
          is_paid: true,
          paid_date: paymentData.paid_date,
          paid_account_id: paymentData.paid_account_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', billId)
        .select()
        .single();

      if (error) {
        console.error('Error paying bill:', error);
        throw error;
      }

      // Criar transação de despesa
      const billData = bills.find(b => b.id === billId);
      if (billData) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert({
            description: `Fatura Cartão ${billData.credit_cards?.name || 'Cartão'}`,
            amount: billData.total_amount,
            date: paymentData.paid_date,
            bank_account_id: paymentData.paid_account_id,
            category: 'Cartão de Crédito'
          });

        if (expenseError) {
          console.error('Error creating expense transaction:', expenseError);
          // Não falha se a transação não for criada, apenas loga o erro
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: "Fatura paga!",
        description: "A fatura foi marcada como paga e a transação foi criada.",
      });
    },
    onError: (error) => {
      console.error('Error paying bill:', error);
      toast({
        title: "Erro ao pagar fatura",
        description: "Não foi possível marcar a fatura como paga.",
        variant: "destructive",
      });
    },
  });

  return {
    bills,
    upcomingBills,
    overdueBills,
    isLoading,
    error,
    payBill: payBill.mutate,
    isPaying: payBill.isPending,
  };
};
