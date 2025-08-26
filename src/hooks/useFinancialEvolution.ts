
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

      // Para cada mês, calcular valores baseados nas transações até aquele mês
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        // 1. Somar todas as receitas até este mês (acumulado)
        const { data: incomeData } = await supabase
          .from('income')
          .select('amount')
          .eq('user_id', user.id)
          .lte('date', monthEnd.toISOString().split('T')[0]);
        
        const totalIncomeUntilMonth = incomeData?.reduce((sum, income) => sum + income.amount, 0) || 0;
        
        // 2. Somar todas as despesas até este mês (acumulado)
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .lte('date', monthEnd.toISOString().split('T')[0]);
        
        const totalExpensesUntilMonth = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        
        // 3. Buscar dívidas que existiam neste mês
        const { data: monthDebts } = await supabase
          .from('debts')
          .select('financed_amount, remaining_balance, total_debt_amount, created_at, start_date, due_date')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString())
          .gte('due_date', monthDate.toISOString().split('T')[0]); // Dívidas que ainda não venceram
        
        const totalDebtsInMonth = monthDebts?.reduce((sum, debt) => {
          // Se é o mês atual, usar remaining_balance, senão usar valor total
          const isCurrentMonth = monthDate.getMonth() === currentDate.getMonth() && 
                                  monthDate.getFullYear() === currentDate.getFullYear();
          return sum + (isCurrentMonth ? debt.remaining_balance : (debt.total_debt_amount || debt.financed_amount));
        }, 0) || 0;
        
        // 4. Buscar investimentos até este mês
        const { data: investmentsData } = await supabase
          .from('investments')
          .select('amount, liquidity, current_value, purchase_date')
          .eq('user_id', user.id)
          .lte('purchase_date', monthEnd.toISOString().split('T')[0]);
        
        const totalInvestments = investmentsData?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
        
        // 5. Buscar contas bancárias criadas até este mês
        const { data: bankAccountsData } = await supabase
          .from('bank_accounts')
          .select('balance, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lte('created_at', monthEnd.toISOString());
        
        const totalBankBalance = bankAccountsData?.reduce((sum, account) => sum + account.balance, 0) || 0;
        
        // Cálculos finais
        const cashFlow = totalIncomeUntilMonth - totalExpensesUntilMonth;
        const totalAssets = cashFlow + totalInvestments + totalBankBalance;
        const netWorth = totalAssets - totalDebtsInMonth;
        
        // Reservas líquidas = saldo em caixa + investimentos líquidos
        const liquidInvestments = investmentsData?.filter(inv => inv.liquidity === 'daily')
          .reduce((sum, inv) => sum + inv.amount, 0) || 0;
        const liquidReserves = Math.max(0, cashFlow) + liquidInvestments + totalBankBalance;
        
        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth,
          totalDebt: totalDebtsInMonth,
          liquidReserves,
          totalAssets,
          totalLiabilities: totalDebtsInMonth
        });
      }

      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
