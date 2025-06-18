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

  // Query para calcular limite disponível correto com nova lógica CORRIGIDA (APENAS CARTÕES ATIVOS)
  const {
    data: creditCardBalances = [],
    isLoading: isLoadingBalances,
  } = useQuery({
    queryKey: ['credit-card-balances'],
    queryFn: async () => {
      console.log('Calculating credit card balances with CORRECT logic (APENAS CARTÕES ATIVOS)...');
      
      const { data: cards, error: cardsError } = await supabase
        .from('credit_cards')
        .select('id, name, credit_limit, is_active')
        .eq('is_active', true); // CRÍTICO: APENAS cartões ativos

      if (cardsError) {
        console.error('Error fetching active cards for balance:', cardsError);
        throw cardsError;
      }

      const balances: CreditCardBalance[] = [];

      for (const card of cards) {
        // CORREÇÃO CRÍTICA: Buscar APENAS parcelas NÃO PAGAS para cálculo correto
        const { data: unpaidInstallments, error: installmentsError } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('credit_card_id', card.id)
          .eq('is_paid', false); // CRÍTICO: apenas não pagas

        if (installmentsError) {
          console.error('Error fetching unpaid installments:', installmentsError);
          throw installmentsError;
        }

        // Somar APENAS as parcelas não pagas
        const totalCommitted = unpaidInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0);
        const availableLimit = Math.max(0, Number(card.credit_limit) - totalCommitted);

        console.log(`Cartão ATIVO ${card.name}: Limite R$ ${card.credit_limit}, Comprometido R$ ${totalCommitted}, Disponível R$ ${availableLimit}`);

        balances.push({
          card_id: card.id,
          card_name: card.name,
          credit_limit: Number(card.credit_limit),
          total_committed: totalCommitted,
          available_limit: availableLimit,
          is_active: card.is_active,
        });
      }

      console.log('Credit card balances calculated with CORRECT logic (APENAS ATIVOS):', balances);
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
        include_in_patrimony: true, // CRÍTICO: habilitar para sincronizar dívidas
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      
      // CRÍTICO: Sincronizar patrimônio após criar cartão
      console.log('CRÍTICO: Sincronizando patrimônio após criação de cartão...');
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização do patrimônio:', syncError);
      }
      
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({
        title: "Cartão criado com sucesso!",
        description: "Seu cartão foi adicionado. As dívidas serão sincronizadas automaticamente no patrimônio.",
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
      
      // Garantir que include_in_patrimony sempre seja true para sincronização
      const sanitizedData = {
        ...updateData,
        include_in_patrimony: true
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      
      // CRÍTICO: Sincronizar patrimônio após atualizar cartão
      console.log('CRÍTICO: Sincronizando patrimônio após atualização de cartão...');
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização do patrimônio:', syncError);
      }
      
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      toast({
        title: "Cartão atualizado!",
        description: "As informações foram atualizadas e as dívidas sincronizadas no patrimônio.",
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
      console.log('Desativando cartão de crédito:', id);
      
      // CRÍTICO: Primeiro desativar o cartão
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting credit card:', error);
        throw error;
      }

      // CRÍTICO: Imediatamente após desativar, sincronizar patrimônio para remover dívidas
      console.log('CRÍTICO: Sincronizando patrimônio após desativação do cartão...');
      const { error: syncError } = await supabase.rpc('sync_credit_card_debts_to_patrimony');
      if (syncError) {
        console.error('Erro na sincronização do patrimônio após desativação:', syncError);
        // Não falhar a operação, mas logar o erro
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-balances'] });
      
      // CRÍTICO: Invalidar patrimônio para refletir a remoção das dívidas
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      
      toast({
        title: "Cartão removido!",
        description: "O cartão foi desativado e as dívidas associadas foram removidas do patrimônio.",
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
