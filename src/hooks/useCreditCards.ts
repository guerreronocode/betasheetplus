
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

  // Query para calcular limite disponível correto
  const {
    data: creditCardBalances = [],
    isLoading: isLoadingBalances,
  } = useQuery({
    queryKey: ['credit-card-balances'],
    queryFn: async () => {
      console.log('Calculating credit card balances...');
      
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
        // Buscar total comprometido: soma de todas as parcelas não pagas
        const { data: unpaidInstallments, error: installmentsError } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('credit_card_id', card.id)
          .eq('is_paid', false);

        if (installmentsError) {
          console.error('Error fetching unpaid installments:', installmentsError);
          throw installmentsError;
        }

        const totalCommitted = unpaidInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0);
        const availableLimit = Number(card.credit_limit) - totalCommitted;

        balances.push({
          card_id: card.id,
          card_name: card.name,
          credit_limit: Number(card.credit_limit),
          total_committed: totalCommitted,
          available_limit: Math.max(0, availableLimit),
          is_active: card.is_active,
        });
      }

      console.log('Credit card balances calculated:', balances);
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
        include_in_patrimony: cardData.include_in_patrimony || false,
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
      toast({
        title: "Cartão criado com sucesso!",
        description: "Seu cartão de crédito foi adicionado.",
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
      const { data, error } = await supabase
        .from('credit_cards')
        .update(updateData)
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
      toast({
        title: "Cartão atualizado!",
        description: "As informações do cartão foram atualizadas.",
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
      toast({
        title: "Cartão removido!",
        description: "O cartão foi removido com sucesso.",
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
