
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
          credit_cards(name, is_active)
        `)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Purchases fetched:', data);
      return data as CreditCardPurchase[];
    },
  });

  const createPurchase = useMutation({
    mutationFn: async (purchaseData: PurchaseFormData) => {
      console.log('Creating purchase:', purchaseData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Se temos parcelas manuais, usar processo customizado
      if (purchaseData.manual_installments && purchaseData.manual_installments.length > 0) {
        // Criar compra
        const insertData: Omit<PurchaseInsertData, 'manual_installments'> = {
          user_id: user.id,
          credit_card_id: purchaseData.credit_card_id,
          description: purchaseData.description,
          amount: purchaseData.amount,
          purchase_date: purchaseData.purchase_date,
          installments: purchaseData.installments,
          category: purchaseData.category,
        };

        const { data: purchase, error: purchaseError } = await supabase
          .from('credit_card_purchases')
          .insert(insertData)
          .select()
          .single();

        if (purchaseError) {
          console.error('Error creating purchase:', purchaseError);
          throw purchaseError;
        }

        // Buscar dados do cartão para calcular datas
        const { data: card, error: cardError } = await supabase
          .from('credit_cards')
          .select('closing_day, due_day')
          .eq('id', purchaseData.credit_card_id)
          .single();

        if (cardError) {
          console.error('Error fetching card data:', cardError);
          throw cardError;
        }

        // Criar parcelas manuais
        for (const [index, installment] of purchaseData.manual_installments.entries()) {
          const installmentDate = new Date(purchaseData.purchase_date);
          installmentDate.setMonth(installmentDate.getMonth() + index);

          // Calcular bill_month usando a mesma lógica do trigger
          const { data: billMonth, error: billMonthError } = await supabase
            .rpc('calculate_bill_month', {
              purchase_date: installmentDate.toISOString().split('T')[0],
              closing_day: card.closing_day
            });

          if (billMonthError) {
            console.error('Error calculating bill month:', billMonthError);
            throw billMonthError;
          }

          const billMonthDate = new Date(billMonth);
          const billCycleMonth = new Date(billMonthDate.getFullYear(), billMonthDate.getMonth(), 1);
          
          // Calcular due_date
          const dueDateMonth = new Date(billCycleMonth);
          dueDateMonth.setMonth(dueDateMonth.getMonth() + 1);
          const safeDueDay = Math.min(card.due_day, new Date(dueDateMonth.getFullYear(), dueDateMonth.getMonth() + 1, 0).getDate());
          const dueDate = new Date(dueDateMonth.getFullYear(), dueDateMonth.getMonth(), safeDueDay - 1);

          // Inserir parcela manual
          const { error: installmentError } = await supabase
            .from('credit_card_installments')
            .insert({
              user_id: user.id,
              purchase_id: purchase.id,
              credit_card_id: purchaseData.credit_card_id,
              installment_number: installment.installment_number,
              amount: installment.amount,
              due_date: dueDate.toISOString().split('T')[0],
              bill_month: billCycleMonth.toISOString().split('T')[0],
            });

          if (installmentError) {
            console.error('Error creating manual installment:', installmentError);
            throw installmentError;
          }

          // Criar ou atualizar fatura
          const { data: existingBill } = await supabase
            .from('credit_card_bills')
            .select('id, total_amount')
            .eq('credit_card_id', purchaseData.credit_card_id)
            .eq('bill_month', billCycleMonth.toISOString().split('T')[0])
            .single();

          if (existingBill) {
            // Atualizar fatura existente
            await supabase
              .from('credit_card_bills')
              .update({
                total_amount: existingBill.total_amount + installment.amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingBill.id);
          } else {
            // Criar nova fatura
            await supabase
              .from('credit_card_bills')
              .insert({
                user_id: user.id,
                credit_card_id: purchaseData.credit_card_id,
                bill_month: billCycleMonth.toISOString().split('T')[0],
                total_amount: installment.amount,
                closing_date: billMonth,
                due_date: dueDate.toISOString().split('T')[0],
              });
          }
        }

        return purchase;
      } else {
        // Processo padrão - deixar o trigger processar
        const insertData: Omit<PurchaseInsertData, 'manual_installments'> = {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-bills'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-installments'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      queryClient.invalidateQueries({ queryKey: ['integrated-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-status'] });
      queryClient.invalidateQueries({ queryKey: ['integrated-categories'] });
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
