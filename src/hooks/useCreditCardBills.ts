
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

      // Buscar faturas com cartões ativos
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
        .eq('credit_cards.is_active', true)
        .order('bill_month', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        throw error;
      }

      console.log('Raw bills data:', rawBills);

      // CORREÇÃO CRÍTICA: Recalcular o valor correto de cada fatura
      const billsWithCorrectValues = [];
      
      for (const bill of rawBills || []) {
        // Buscar EXATAMENTE as parcelas desta fatura específica
        const { data: installments, error: installmentsError } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('credit_card_id', bill.credit_card_id)
          .eq('bill_month', bill.bill_month);

        if (installmentsError) {
          console.error('Error fetching installments for bill:', bill.id, installmentsError);
          continue;
        }

        // Calcular o valor CORRETO da fatura = soma exata das parcelas
        const correctBillAmount = installments?.reduce((sum, inst) => sum + Number(inst.amount), 0) || 0;
        
        console.log(`Fatura ${bill.id}: Valor original R$ ${bill.total_amount}, Valor correto R$ ${correctBillAmount}`);

        // Se o valor estiver incorreto, atualizar no banco
        if (Math.abs(Number(bill.total_amount) - correctBillAmount) > 0.01) {
          console.log(`Corrigindo valor da fatura ${bill.id} de R$ ${bill.total_amount} para R$ ${correctBillAmount}`);
          
          const { error: updateError } = await supabase
            .from('credit_card_bills')
            .update({ total_amount: correctBillAmount })
            .eq('id', bill.id);

          if (updateError) {
            console.error('Erro ao corrigir valor da fatura:', updateError);
          }
        }

        // Se há parcelas OU está marcada como paga, incluir na lista
        if ((installments && installments.length > 0) || bill.is_paid) {
          billsWithCorrectValues.push({
            ...bill,
            total_amount: correctBillAmount // Usar o valor correto
          });
        } else {
          // Se não tem parcelas e não está paga, remover a fatura órfã
          console.log('Removing orphan bill:', bill.id);
          await supabase
            .from('credit_card_bills')
            .delete()
            .eq('id', bill.id);
        }
      }

      console.log('Bills with correct values:', billsWithCorrectValues);
      return billsWithCorrectValues as CreditCardBill[];
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

      // Marcar todas as parcelas desta fatura como pagas
      const { error: installmentsError } = await supabase
        .from('credit_card_installments')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          payment_account_id: paymentData.paid_account_id,
        })
        .eq('credit_card_id', data.credit_card_id)
        .eq('bill_month', data.bill_month);

      if (installmentsError) {
        console.error('Error updating installments:', installmentsError);
        throw installmentsError;
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

      console.log('CRÍTICO: Fatura paga, executando sincronização obrigatória do patrimônio...');
      
      // CRÍTICO: Sincronizar patrimônio após pagamento
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização do patrimônio após pagamento:', syncError);
        // Não falhar o pagamento por causa disso, mas logar
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['liabilities'] }); // CRÍTICO: invalidar patrimônio
      toast({
        title: "Fatura paga!",
        description: "A fatura foi marcada como paga, o saldo da conta foi atualizado e o patrimônio foi sincronizado.",
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
