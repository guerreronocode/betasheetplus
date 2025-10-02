
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

  // CORRIGIDO: Calcular TODAS as faturas futuras não pagas (sem limite de dias)
  const upcomingBills = bills.filter(bill => {
    if (bill.is_paid) return false;
    const dueDate = new Date(bill.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today; // Todas as faturas com vencimento >= hoje
  });
  
  console.log('📊 [useCreditCardBills] Total bills:', bills.length);
  console.log('📊 [useCreditCardBills] Upcoming bills (not paid, due >= today):', upcomingBills.length);
  console.log('📊 [useCreditCardBills] Upcoming bills details:', upcomingBills.map(b => ({
    id: b.id,
    due_date: b.due_date,
    total_amount: b.total_amount,
    is_paid: b.is_paid
  })));

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

      // BUSCAR DADOS DA FATURA ANTES DE PROCESSAR
      const { data: billDataBefore, error: billBeforeError } = await supabase
        .from('credit_card_bills')
        .select('user_id, credit_card_id, bill_month, total_amount, paid_amount')
        .eq('id', billId)
        .single();

      if (billBeforeError) {
        console.error('Error fetching bill data before payment:', billBeforeError);
        throw billBeforeError;
      }

      // Calcular valor restante a ser pago
      const remainingAmount = billDataBefore.total_amount - (billDataBefore.paid_amount || 0);
      console.log(`Fatura ${billId}: Total R$ ${billDataBefore.total_amount}, Já pago R$ ${billDataBefore.paid_amount || 0}, Restante R$ ${remainingAmount}`);

      if (remainingAmount <= 0) {
        console.log('Fatura já está totalmente paga');
        return billDataBefore;
      }

      // VALIDAR SALDO SUFICIENTE NA CONTA
      const { data: accountData, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', paymentData.paid_account_id)
        .single();

      if (accountError) {
        console.error('Error fetching account balance:', accountError);
        throw new Error('Erro ao verificar saldo da conta');
      }

      if (accountData.balance < remainingAmount) {
        throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${accountData.balance.toFixed(2)}, Valor necessário: R$ ${remainingAmount.toFixed(2)}`);
      }

      // Usar nova função para marcar fatura como paga
      const { data, error } = await supabase.rpc('mark_bill_as_paid', {
        p_bill_id: billId,
        p_payment_account_id: paymentData.paid_account_id
      });

      if (error) {
        console.error('Error marking bill as paid:', error);
        throw error;
      }

      // Atualizar dados adicionais da fatura
      const { error: updateError } = await supabase
        .from('credit_card_bills')
        .update({
          paid_date: paymentData.paid_date,
        })
        .eq('id', billId);

      if (updateError) {
        console.error('Error updating bill additional data:', updateError);
        throw updateError;
      }

      // Marcar todas as parcelas desta fatura como pagas
      const { error: installmentsError } = await supabase
        .from('credit_card_installments')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          payment_account_id: paymentData.paid_account_id,
        })
        .eq('credit_card_id', billDataBefore.credit_card_id)
        .eq('bill_month', billDataBefore.bill_month);

      if (installmentsError) {
        console.error('Error updating installments:', installmentsError);
        throw installmentsError;
      }

      // CRIAR TRANSAÇÃO DE DESPESA APENAS COM O VALOR RESTANTE
      const { data: cardData, error: cardError } = await supabase
        .from('credit_cards')
        .select('name')
        .eq('id', billDataBefore.credit_card_id)
        .single();

      if (!cardError && cardData) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert({
            user_id: billDataBefore.user_id,
            description: `Pagamento fatura ${cardData.name}`,
            amount: remainingAmount, // USAR APENAS O VALOR RESTANTE
            category: 'Cartão de Crédito',
            date: paymentData.paid_date,
            bank_account_id: paymentData.paid_account_id
          });

        if (expenseError) {
          console.error('Erro ao criar transação de despesa:', expenseError);
        }
      }

      console.log('CRÍTICO: Fatura paga, executando sincronização obrigatória do patrimônio...');
      
      // CRÍTICO: Sincronizar patrimônio após pagamento
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização do patrimônio após pagamento:', syncError);
        // Não falhar o pagamento por causa disso, mas logar
      }

      return billDataBefore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['liabilities'] }); // CRÍTICO: invalidar patrimônio
      queryClient.invalidateQueries({ queryKey: ['expenses'] }); // Invalidar despesas
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

  // Mutation para pagamento parcial de fatura
  const payPartialBillMutation = useMutation({
    mutationFn: async ({ 
      billId, 
      installmentPayments, 
      paymentAccountId 
    }: { 
      billId: string; 
      installmentPayments: Array<{installment_id: string; amount: number}>; 
      paymentAccountId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // VALIDAR SALDO SUFICIENTE NA CONTA
      const totalPaid = installmentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const { data: accountData, error: accountError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', paymentAccountId)
        .single();

      if (accountError) {
        console.error('Error fetching account balance:', accountError);
        throw new Error('Erro ao verificar saldo da conta');
      }

      if (accountData.balance < totalPaid) {
        throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${accountData.balance.toFixed(2)}, Valor necessário: R$ ${totalPaid.toFixed(2)}`);
      }
      
      const { error } = await supabase.rpc('process_partial_bill_payment', {
        p_bill_id: billId,
        p_installment_payments: installmentPayments,
        p_payment_account_id: paymentAccountId
      });
      
      if (error) throw error;
      
      // CRIAR TRANSAÇÃO DE DESPESA PARA PAGAMENTO PARCIAL
      
      const { data: billData } = await supabase
        .from('credit_card_bills')
        .select('user_id, credit_card_id')
        .eq('id', billId)
        .single();

      const { data: cardData } = await supabase
        .from('credit_cards')
        .select('name')
        .eq('id', billData?.credit_card_id)
        .single();

      if (billData && cardData) {
        await supabase
          .from('expenses')
          .insert({
            user_id: billData.user_id,
            description: `Pagamento parcial fatura ${cardData.name}`,
            amount: totalPaid,
            category: 'Cartão de Crédito',
            date: new Date().toISOString().split('T')[0],
            bank_account_id: paymentAccountId
          });
      }

      // Após pagamento, sincronizar dívidas do cartão no patrimônio
      await supabase.rpc('sync_credit_card_debts_to_patrimony');
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit_card_balances'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['patrimony'] });
      queryClient.invalidateQueries({ queryKey: ['bill_details'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] }); // Invalidar despesas
      toast({ title: 'Pagamento parcial processado com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao processar pagamento parcial', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    bills,
    upcomingBills,
    overdueBills,
    isLoading,
    error,
    payBill: payBillMutation.mutate,
    payPartialBill: payPartialBillMutation.mutate,
    isPaying: payBillMutation.isPending,
    isPayingPartial: payPartialBillMutation.isPending,
  };
};
