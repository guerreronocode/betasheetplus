
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CreditCardFormData, CreditCardInsertData } from '@/types/creditCard';

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

  const createCreditCard = useMutation({
    mutationFn: async (cardData: CreditCardFormData) => {
      console.log('Creating credit card:', cardData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Converter dados do formulário para dados de inserção
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
    isLoading,
    error,
    createCreditCard: createCreditCard.mutate,
    updateCreditCard: updateCreditCard.mutate,
    deleteCreditCard: deleteCreditCard.mutate,
    isCreating: createCreditCard.isPending,
    isUpdating: updateCreditCard.isPending,
    isDeleting: deleteCreditCard.isPending,
  };
};
