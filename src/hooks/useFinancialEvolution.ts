
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, format } from 'date-fns';
import { useFinancialData } from './useFinancialData';
import { useCreditCardDebts } from './useCreditCardDebts';

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
  const { 
    bankAccounts, 
    investments, 
    assets, 
    liabilities, 
    isLoading: financialDataLoading 
  } = useFinancialData();
  const { creditCardDebts, isLoading: creditCardDebtsLoading } = useCreditCardDebts();

  return useQuery({
    queryKey: ['financial-evolution', user?.id, periodMonths],
    queryFn: async () => {
      if (!user) return [];

      const currentDate = new Date();
      const data: FinancialEvolutionData[] = [];

      console.log('=== DEBUG FINANCIAL EVOLUTION ===');
      console.log('Bank accounts:', bankAccounts);
      console.log('Investments:', investments);  
      console.log('Assets:', assets);
      console.log('Liabilities:', liabilities);
      console.log('Credit Card Debts:', creditCardDebts);
      
      // 1. Patrimônio Líquido = (Ativos Circulantes + Não Circulantes) - (Passivos Circulantes + Não Circulantes)
      const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
      const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
      const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
      const totalLiabilitiesValue = liabilities.reduce((sum, liability) => sum + liability.remaining_amount, 0);
      
      // Total de ativos (circulantes + não circulantes)
      const totalAssets = totalBankBalance + totalInvestmentValue + totalAssetsValue;
      
      // 2. Dívidas = Total das dívidas reais (incluindo cartões de crédito)
      const creditCardDebtTotal = creditCardDebts?.reduce((sum, debt) => sum + debt.total_debt, 0) || 0;
      const totalDebt = totalLiabilitiesValue + creditCardDebtTotal;
      
      // Total de passivos (circulantes + não circulantes) = Dívidas
      const totalPassivos = totalDebt;
      
      // Patrimônio Líquido = Ativos - Passivos
      const netWorth = totalAssets - totalPassivos;

      // 3. Reserva Líquida = Contas bancárias + investimentos com liquidez diária
      const liquidReserves = totalBankBalance + investments
        .filter(inv => inv.liquidity === 'daily')
        .reduce((sum, inv) => sum + inv.current_value, 0);

      console.log('=== VALORES CALCULADOS ===');
      console.log('totalBankBalance:', totalBankBalance);
      console.log('totalInvestmentValue:', totalInvestmentValue);
      console.log('totalAssetsValue:', totalAssetsValue);
      console.log('totalLiabilitiesValue:', totalLiabilitiesValue);
      console.log('creditCardDebtTotal:', creditCardDebtTotal);
      console.log('totalAssets:', totalAssets);
      console.log('totalDebt:', totalDebt);
      console.log('netWorth:', netWorth);
      console.log('liquidReserves:', liquidReserves);

      // Para simplificar, vamos mostrar os valores atuais para todos os meses
      // Em uma implementação futura, você pode buscar dados históricos reais
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        
        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth,
          totalDebt,
          liquidReserves,
          totalAssets,
          totalLiabilities: totalPassivos
        });
      }

      return data;
    },
    enabled: !!user && !financialDataLoading && !creditCardDebtsLoading,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
