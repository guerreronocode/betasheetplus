
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditLimitProjection } from '@/types/creditCard';

export const useCreditCardProjections = (creditCardId?: string) => {
  const {
    data: projections = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-projections', creditCardId],
    queryFn: async () => {
      console.log('Calculating credit card projections with correct logic...');
      
      if (!creditCardId) {
        return [];
      }

      // Buscar limite do cartão
      const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('credit_limit')
        .eq('id', creditCardId)
        .single();

      if (cardError) {
        console.error('Error fetching card for projections:', cardError);
        throw cardError;
      }

      const projections: CreditLimitProjection[] = [];
      const currentMonth = new Date();
      currentMonth.setDate(1); // Primeiro dia do mês atual

      // Calcular projeções para os próximos 12 meses
      for (let i = 0; i < 12; i++) {
        const projectionMonth = new Date(currentMonth);
        projectionMonth.setMonth(currentMonth.getMonth() + i);
        const projectionMonthStr = projectionMonth.toISOString().split('T')[0].substring(0, 7) + '-01';

        // Buscar todas as compras do cartão
        const { data: purchases, error: purchasesError } = await supabase
          .from('credit_card_purchases')
          .select('id, amount')
          .eq('credit_card_id', creditCardId);

        if (purchasesError) {
          console.error('Error fetching purchases for projection:', purchasesError);
          continue;
        }

        let projectedCommitted = 0;

        // Para cada compra, calcular quanto estará comprometido no mês projetado
        for (const purchase of purchases) {
          const totalPurchaseValue = Number(purchase.amount);
          
          // Buscar parcelas que estarão pagas até o mês projetado
          const { data: paidInstallments, error: paidError } = await supabase
            .from('credit_card_installments')
            .select('amount')
            .eq('purchase_id', purchase.id)
            .or(`is_paid.eq.true,bill_month.lt.${projectionMonthStr}`);

          if (paidError) {
            console.error('Error fetching paid installments for projection:', paidError);
            continue;
          }

          const totalPaidForThisPurchase = paidInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0);
          const stillCommittedForThisPurchase = totalPurchaseValue - totalPaidForThisPurchase;
          
          projectedCommitted += Math.max(0, stillCommittedForThisPurchase);
        }

        const projectedAvailable = Math.max(0, Number(card.credit_limit) - projectedCommitted);

        projections.push({
          month: projectionMonth.toISOString().split('T')[0],
          projected_available_limit: projectedAvailable
        });
      }

      console.log('Credit card projections calculated with correct logic:', projections);
      return projections;
    },
    enabled: !!creditCardId,
  });

  return {
    projections,
    isLoading,
    error,
  };
};
