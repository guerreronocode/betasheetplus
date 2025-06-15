
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface YieldRateHistory {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string; // ex: "2025-06-10"
  created_at: string;
}

interface Options {
  enabled?: boolean;
  type: string; // 'cdi', 'selic', 'ipca', etc
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
}

/**
 * Retorna o histórico de taxas de um tipo específico em um período.
 */
export function useYieldRatesHistory({ type, start, end, enabled=true }: Options) {
  // Previna busca se algum valor não estiver pronto
  const shouldFetch = Boolean(type && start && end && enabled);

  return useQuery({
    queryKey: ['yield_rates_history', type, start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yield_rates_history')
        .select('*')
        .eq('rate_type', type)
        .gte('reference_date', start)
        .lte('reference_date', end)
        .order('reference_date', { ascending: true });
      if (error) {
        console.error('[YieldHistory] Erro ao buscar histórico de taxas:', error);
        return [];
      }
      return data as YieldRateHistory[];
    },
    enabled: shouldFetch,
  });
}
