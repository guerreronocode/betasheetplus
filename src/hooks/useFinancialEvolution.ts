
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, format } from 'date-fns';
import { useFinancialData } from './useFinancialData';
import { useDebts } from '@/modules/debts/hooks/useDebts';

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
  const { totalDebts, isLoading: debtsLoading } = useDebts();

  return useQuery({
    queryKey: ['financial-evolution', user?.id, periodMonths],
    queryFn: async () => {
      if (!user) return [];

      const currentDate = new Date();
      const data: FinancialEvolutionData[] = [];

      // Para cada mês, calcular valores históricos baseados nos dados que existiam até aquele mês
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0); // Último dia do mês
        
        // 1. Contas bancárias criadas até este mês (usamos saldo atual por limitação do sistema)
        const { data: monthBankAccounts } = await supabase
          .from('bank_accounts')
          .select('balance, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lte('created_at', monthEnd.toISOString());
        
        const totalBankBalance = monthBankAccounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
        
        // 2. Investimentos feitos até este mês (usar valor histórico - amount investido na época)
        const { data: monthInvestments } = await supabase
          .from('investments')
          .select('amount, liquidity, purchase_date')
          .eq('user_id', user.id)
          .lte('purchase_date', monthEnd.toISOString());
        
        const totalInvestmentValue = monthInvestments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
        
        // 3. Ativos cadastrados até este mês (usar valor de compra quando disponível)
        const { data: monthAssets } = await supabase
          .from('assets')
          .select('current_value, purchase_value, created_at')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());
        
        const totalAssetsValue = monthAssets?.reduce((sum, asset) => {
          // Usar valor de compra se disponível, senão valor atual
          return sum + (asset.purchase_value || asset.current_value);
        }, 0) || 0;
        
        // 4. Passivos (liabilities) cadastrados até este mês (usar valor total inicial)
        const { data: monthLiabilities } = await supabase
          .from('liabilities')
          .select('total_amount, remaining_amount, created_at')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());
        
        const totalLiabilitiesValue = monthLiabilities?.reduce((sum, liability) => {
          // Usar valor total para meses passados, remaining_amount para mês atual
          const isCurrentMonth = monthDate.getMonth() === currentDate.getMonth() && 
                                  monthDate.getFullYear() === currentDate.getFullYear();
          return sum + (isCurrentMonth ? liability.remaining_amount : liability.total_amount);
        }, 0) || 0;
        
        // 5. Dívidas cadastradas até este mês (da aba Dívidas - usar valor inicial para histórico)
        const { data: monthDebts } = await supabase
          .from('debts')
          .select('financed_amount, remaining_balance, total_debt_amount, created_at')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());
        
        const totalDebtsValue = monthDebts?.reduce((sum, debt) => {
          // Usar valor total da dívida para meses passados, remaining_balance para mês atual
          const isCurrentMonth = monthDate.getMonth() === currentDate.getMonth() && 
                                  monthDate.getFullYear() === currentDate.getFullYear();
          return sum + (isCurrentMonth ? debt.remaining_balance : (debt.total_debt_amount || debt.financed_amount));
        }, 0) || 0;
        
        // Cálculos finais para este mês
        const totalAssets = totalBankBalance + totalInvestmentValue + totalAssetsValue;
        const totalDebt = totalLiabilitiesValue + totalDebtsValue;
        const netWorth = totalAssets - totalDebt;
        
        // Reservas líquidas = contas bancárias + investimentos com liquidez diária
        const liquidReserves = totalBankBalance + (monthInvestments?.filter(inv => inv.liquidity === 'daily')
          .reduce((sum, inv) => sum + inv.amount, 0) || 0);
        
        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth,
          totalDebt,
          liquidReserves,
          totalAssets,
          totalLiabilities: totalDebt
        });
      }

      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
