
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

      // Buscar todas as faturas (bills) do cartão
      const { data: bills, error: billsError } = await supabase
        .from('credit_card_bills')
        .select('*')
        .eq('credit_card_id', creditCardId)
        .order('bill_month', { ascending: true });

      if (billsError) {
        console.error('Error fetching bills for projections:', billsError);
        throw billsError;
      }

      // Calcular projeções para os próximos 12 meses
      for (let i = 0; i < 12; i++) {
        const projectionMonth = new Date(currentMonth);
        projectionMonth.setMonth(currentMonth.getMonth() + i);
        const projectionMonthStr = projectionMonth.toISOString().split('T')[0].substring(0, 7);

        let projectedCommitted = 0;

        // Para cada fatura, verificar se ela impacta o mês de projeção
        for (const bill of bills) {
          const billMonthStr = bill.bill_month.substring(0, 7);
          
          // Se a fatura for do mês atual ou futura, assumir que será paga
          if (billMonthStr >= projectionMonthStr) {
            // Se a fatura não está paga e é deste mês ou anterior, ela impacta o limite
            if (!bill.is_paid && billMonthStr <= projectionMonthStr) {
              projectedCommitted += Number(bill.total_amount);
            }
          }
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
