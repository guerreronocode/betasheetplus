
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreditCardBill, BillPaymentFormData } from '@/types/creditCard';

export const useCreditCardBills = () => {
  const { user } = useAuth();
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
      
      if (!user) return [];

      // Buscar faturas que realmente têm parcelas associadas
      const { data, error } = await supabase
        .from('credit_card_bills')
        .select(`
          *,
          credit_cards!inner(
            name,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('credit_cards.is_active', true)
        .order('bill_month', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }

      console.log('Raw bills data:', data);

      // Filtrar faturas que realmente têm parcelas
      const billsWithInstallments = [];
      
      for (const bill of data || []) {
        // Verificar se a fatura tem parcelas associadas
        const { data: installments, error: installmentsError } = await supabase
          .from('credit_card_installments')
          .select('id')
          .eq('credit_card_id', bill.credit_card_id)
          .eq('bill_month', bill.bill_month);

        if (installmentsError) {
          console.error('Error checking installments for bill:', bill.id, installmentsError);
          continue;
        }

        // Se a fatura tem parcelas OU está marcada como paga, incluir na lista
        if ((installments && installments.length > 0) || bill.is_paid) {
          billsWithInstallments.push(bill);
        } else {
          // Se não tem parcelas e não está paga, remover a fatura órfã
          console.log('Removing orphan bill:', bill.id);
          await supabase
            .from('credit_card_bills')
            .delete()
            .eq('id', bill.id);
        }
      }

      console.log('Bills with installments:', billsWithInstallments);
      return billsWithInstallments as CreditCardBill[];
    },
    enabled: !!user,
  });

  // Calcular faturas próximas ao vencimento (próximos 7 dias)
  const upcomingBills = bills.filter(bill => {
    if (bill.is_paid) return false;
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Calcular faturas em atraso
  const overdueBills = bills.filter(bill => {
    if (bill.is_paid) return false;
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    return dueDate < today;
  });

  const payBillMutation = useMutation({
    mutationFn: async ({ billId, paymentData }: { billId: string; paymentData: BillPaymentFormData }) => {
      console.log('Paying bill:', billId, paymentData);

      // Atualizar a fatura como paga
      const { data, error } = await supabase
        .from('credit_card_bills')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_date: paymentData.paid_date,
          paid_account_id: paymentData.paid_account_id,
        })
        .eq('id', billId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bill:', error);
        throw error;
      }

      // Se uma conta bancária foi especificada, debitar o valor
      if (paymentData.paid_account_id) {
        const { data: account, error: accountError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', paymentData.paid_account_id)
          .single();

        if (accountError) {
          console.error('Error fetching account:', accountError);
          throw accountError;
        }

        const newBalance = account.balance - data.total_amount;
        
        const { error: updateError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.paid_account_id);

        if (updateError) {
          console.error('Error updating account balance:', updateError);
          throw updateError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      toast({
        title: "Fatura paga!",
        description: "A fatura foi marcada como paga e o saldo da conta foi atualizado.",
      });
    },
    onError: (error) => {
      console.error('Error paying bill:', error);
      toast({
        title: "Erro ao pagar fatura",
        description: "Não foi possível processar o pagamento da fatura.",
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
    payBill: payBillMutation.mutate,
    isPaying: payBillMutation.isPending,
  };
};
