
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCreditCardDebts = () => {
  const {
    data: creditCardDebts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-debts'],
    queryFn: async () => {
      console.log('Calculando dívidas de cartão de crédito APENAS de cartões ativos...');
      
      // Buscar apenas cartões ATIVOS
      const { data: activeCards, error: cardsError } = await supabase
        .from('credit_cards')
        .select('id, name')
        .eq('is_active', true);

      if (cardsError) {
        console.error('Erro ao buscar cartões ativos:', cardsError);
        throw cardsError;
      }

      if (!activeCards || activeCards.length === 0) {
        console.log('Nenhum cartão ativo encontrado - retornando array vazio');
        return [];
      }

      const activeCardIds = activeCards.map(card => card.id);
      console.log('Cartões ativos encontrados:', activeCardIds);

      // Buscar apenas parcelas não pagas de cartões ATIVOS
      const { data: unpaidInstallments, error: installmentsError } = await supabase
        .from('credit_card_installments')
        .select(`
          credit_card_id,
          amount,
          credit_cards!inner(name, is_active)
        `)
        .eq('is_paid', false)
        .eq('credit_cards.is_active', true)
        .in('credit_card_id', activeCardIds);

      if (installmentsError) {
        console.error('Erro ao buscar parcelas não pagas:', installmentsError);
        throw installmentsError;
      }

      // Agrupar dívidas por cartão
      const debtsByCard = new Map();
      
      unpaidInstallments?.forEach(installment => {
        const cardId = installment.credit_card_id;
        const cardName = installment.credit_cards.name;
        
        if (!debtsByCard.has(cardId)) {
          debtsByCard.set(cardId, {
            id: `credit-card-debt-${cardId}`,
            credit_card_id: cardId,
            card_name: cardName,
            total_debt: 0,
            source: 'credit_card_debt'
          });
        }
        
        const existing = debtsByCard.get(cardId);
        existing.total_debt += Number(installment.amount);
      });

      const debts = Array.from(debtsByCard.values()).filter(debt => debt.total_debt > 0);
      
      console.log('Dívidas de cartão calculadas (APENAS cartões ativos):', debts);
      return debts;
    },
  });

  return {
    creditCardDebts,
    isLoading,
    error,
  };
};
