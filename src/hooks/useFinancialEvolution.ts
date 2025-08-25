
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, format } from 'date-fns';
import { useFinancialData } from './useFinancialData';

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
  const { bankAccounts, investments, assets, liabilities, isLoading: financialDataLoading } = useFinancialData();

  return useQuery({
    queryKey: ['financial-evolution', user?.id, periodMonths],
    queryFn: async () => {
      if (!user) return [];

      const currentDate = new Date();
      const data: FinancialEvolutionData[] = [];

      // Calcular dados atuais
      const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
      const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
      const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
      const totalLiabilitiesValue = liabilities.reduce((sum, liability) => sum + liability.remaining_amount, 0);
      
      const liquidReserves = totalBankBalance + investments.filter(inv => inv.liquidity === 'daily').reduce((sum, inv) => sum + inv.current_value, 0);
      const totalAssets = totalBankBalance + totalInvestmentValue + totalAssetsValue;
      const totalLiabilities = totalLiabilitiesValue;
      const netWorth = totalAssets - totalLiabilities;

      console.log('Calculando dados financeiros atuais:', {
        totalBankBalance,
        totalInvestmentValue,
        totalAssetsValue,
        totalLiabilitiesValue,
        liquidReserves,
        totalAssets,
        totalLiabilities,
        netWorth
      });

      // Para simplificar, vamos mostrar os valores atuais para todos os meses
      // Em uma implementação futura, você pode buscar dados históricos reais
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        
        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth,
          totalDebt: totalLiabilities,
          liquidReserves,
          totalAssets,
          totalLiabilities
        });
      }

      console.log('Dados finais estruturados:', data);
      return data;
    },
    enabled: !!user && !financialDataLoading,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
