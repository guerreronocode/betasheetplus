
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditLimitProjection } from '@/types/creditCard';

export const useCreditCardProjections = (creditCardId?: string, monthsAhead: number = 12) => {
  const {
    data: projections = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['credit-card-projections', creditCardId, monthsAhead],
    queryFn: async () => {
      if (!creditCardId) return [];
      
      console.log('Fetching credit card projections for:', creditCardId);
      
      const { data, error } = await supabase
        .rpc('calculate_projected_credit_limit', {
          p_credit_card_id: creditCardId,
          p_months_ahead: monthsAhead
        });

      if (error) {
        console.error('Error fetching projections:', error);
        throw error;
      }

      console.log('Projections fetched:', data);
      return data as CreditLimitProjection[];
    },
    enabled: !!creditCardId,
  });

  return {
    projections,
    isLoading,
    error,
  };
};
