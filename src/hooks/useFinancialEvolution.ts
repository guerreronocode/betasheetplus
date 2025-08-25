
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, format } from 'date-fns';

export interface FinancialEvolutionData {
  month: string;
  netWorth: number;
  totalDebt: number;
  liquidReserves: number;
  totalAssets: number;
  totalLiabilities: number;
}

export const useFinancialEvolution = (periodMonths: number = 12) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-evolution', user?.id, periodMonths],
    queryFn: async () => {
      if (!user) return [];

      const currentDate = new Date();
      const data: FinancialEvolutionData[] = [];

      // Usar a view otimizada para buscar dados financeiros consolidados
      const { data: viewData, error } = await supabase
        .from('financial_evolution_data')
        .select('month_date, total_assets, total_liabilities, liquid_reserves, net_worth')
        .gte('month_date', subMonths(currentDate, periodMonths - 1).toISOString())
        .lte('month_date', currentDate.toISOString())
        .order('month_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar dados da evolução financeira:', error);
        return [];
      }

      // Agrupar por mês e pegar os valores únicos por mês
      const monthlyData = new Map<string, {
        totalAssets: number;
        totalLiabilities: number;
        liquidReserves: number;
        netWorth: number;
      }>();

      viewData?.forEach(row => {
        const monthKey = format(new Date(row.month_date), 'yyyy-MM');
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            totalAssets: Number(row.total_assets) || 0,
            totalLiabilities: Number(row.total_liabilities) || 0,
            liquidReserves: Number(row.liquid_reserves) || 0,
            netWorth: Number(row.net_worth) || 0
          });
        }
      });

      // Gerar dados para cada mês no período solicitado
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthData = monthlyData.get(monthKey) || {
          totalAssets: 0,
          totalLiabilities: 0,
          liquidReserves: 0,
          netWorth: 0
        };

        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth: monthData.netWorth,
          totalDebt: monthData.totalLiabilities,
          liquidReserves: monthData.liquidReserves,
          totalAssets: monthData.totalAssets,
          totalLiabilities: monthData.totalLiabilities
        });
      }

      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos - mais rápido para ver mudanças
  });
};
