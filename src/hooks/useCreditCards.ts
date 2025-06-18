
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CreditCardFormData, CreditCardInsertData, CreditCardBalance } from '@/types/creditCard';

export const useCreditCards = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: creditCards = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-cards'],
    queryFn: async () => {
      console.log('Fetching credit cards...');
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credit cards:', error);
        throw error;
      }

      console.log('Credit cards fetched:', data);
      return data as CreditCard[];
    },
  });

  // Query para buscar cartões incluindo inativos (para mostrar compras históricas)
  const {
    data: allCreditCards = [],
    isLoading: isLoadingAll,
  } = useQuery({
    queryKey: ['all-credit-cards'],
    queryFn: async () => {
      console.log('Fetching all credit cards (including inactive)...');
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all credit cards:', error);
        throw error;
      }

      return data as CreditCard[];
    },
  });

  // Query para calcular limite disponível correto com nova lógica
  const {
    data: creditCardBalances = [],
    isLoading: isLoadingBalances,
  } = useQuery({
    queryKey: ['credit-card-balances'],
    queryFn: async () => {
      console.log('Calculating credit card balances with correct logic...');
      
      const { data: cards, error: cardsError } = await supabase
        .from('credit_cards')
        .select('id, name, credit_limit, is_active')
        .eq('is_active', true);

      if (cardsError) {
        console.error('Error fetching cards for balance:', cardsError);
        throw cardsError;
      }

      const balances: CreditCardBalance[] = [];

      for (const card of cards) {
        // Nova lógica: Buscar todas as compras do cartão
        const { data: purchases, error: purchasesError } = await supabase
          .from('credit_card_purchases')
          .select('id, amount')
          .eq('credit_card_id', card.id);

        if (purchasesError) {
          console.error('Error fetching purchases:', purchasesError);
          throw purchasesError;
        }

        let totalCommitted = 0;

        // Para cada compra, calcular quanto ainda está comprometido no limite
        for (const purchase of purchases) {
          // Valor total da compra
          const totalPurchaseValue = Number(purchase.amount);
          
          // Buscar parcelas já pagas desta compra específica
          const { data: paidInstallments, error: paidError } = await supabase
            .from('credit_card_installments')
            .select('amount')
            .eq('purchase_id', purchase.id)
            .eq('is_paid', true);

          if (paidError) {
            console.error('Error fetching paid installments:', paidError);
            throw paidError;
          }

          // Somar o valor das parcelas já pagas desta compra
          const totalPaidForThisPurchase = paidInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0);
          
          // Valor ainda comprometido no limite = Valor total da compra - Parcelas já pagas
          const stillCommittedForThisPurchase = totalPurchaseValue - totalPaidForThisPurchase;
          
          // Adicionar ao total comprometido (não pode ser negativo)
          totalCommitted += Math.max(0, stillCommittedForThisPurchase);
          
          console.log(`Compra ${purchase.id}: Total R$ ${totalPurchaseValue}, Pago R$ ${totalPaidForThisPurchase}, Comprometido R$ ${stillCommittedForThisPurchase}`);
        }

        const availableLimit = Math.max(0, Number(card.credit_limit) - totalCommitted);

        console.log(`Cartão ${card.name}: Limite R$ ${card.credit_limit}, Comprometido R$ ${totalCommitted}, Disponível R$ ${availableLimit}`);

        balances.push({
          card_id: card.id,
          card_name: card.name,
          credit_limit: Number(card.credit_limit),
          total_committed: totalCommitted,
          available_limit: availableLimit,
          is_active: card.is_active,
        });
      }

      console.log('Credit card balances calculated with correct logic:', balances);
      return balances;
    },
  });

  const createCreditCard = useMutation({
    mutationFn: async (cardData: CreditCardFormData) => {
      console.log('Creating credit card:', cardData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const insertData: CreditCardInsertData = {
        user_id: user.id,
        name: cardData.name,
        credit_limit: cardData.credit_limit,
        closing_day: cardData.closing_day,
        due_day: cardData.due_day,
        include_in_patrimony: false, // Sempre false - limite não é patrimônio
      };

      const { data, error } = await supabase
        .from('credit_cards')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating credit card:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      // Invalidar patrimônio para sincronizar dívidas automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({
        title: "Cartão criado com sucesso!",
        description: "Seu cartão de crédito foi adicionado. As dívidas relacionadas serão sincronizadas automaticamente no patrimônio.",
      });
    },
    onError: (error) => {
      console.error('Error creating credit card:', error);
      toast({
        title: "Erro ao criar cartão",
        description: "Não foi possível criar o cartão de crédito.",
        variant: "destructive",
      });
    },
  });

  const updateCreditCard = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<CreditCard> & { id: string }) => {
      console.log('Updating credit card:', id, updateData);
      
      // Garantir que include_in_patrimony sempre seja false
      const sanitizedData = {
        ...updateData,
        include_in_patrimony: false
      };
      
      const { data, error } = await supabase
        .from('credit_cards')
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating credit card:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      // Invalidar patrimônio para sincronizar dívidas automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({
        title: "Cartão atualizado!",
        description: "As informações do cartão foram atualizadas e as dívidas foram sincronizadas no patrimônio.",
      });
    },
    onError: (error) => {
      console.error('Error updating credit card:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: "Não foi possível atualizar o cartão.",
        variant: "destructive",
      });
    },
  });

  const deleteCreditCard = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting credit card:', id);
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting credit card:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      // Invalidar patrimônio para sincronizar dívidas automaticamente
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({
        title: "Cartão removido!",
        description: "O cartão foi removido e as dívidas associadas foram removidas do patrimônio.",
      });
    },
    onError: (error) => {
      console.error('Error deleting credit card:', error);
      toast({
        title: "Erro ao remover cartão",
        description: "Não foi possível remover o cartão.",
        variant: "destructive",
      });
    },
  });

  return {
    creditCards,
    allCreditCards,
    creditCardBalances,
    isLoading,
    isLoadingAll,
    isLoadingBalances,
    error,
    createCreditCard: createCreditCard.mutate,
    updateCreditCard: updateCreditCard.mutate,
    deleteCreditCard: deleteCreditCard.mutate,
    isCreating: createCreditCard.isPending,
    isUpdating: updateCreditCard.isPending,
    isDeleting: deleteCreditCard.isPending,
  };
};
