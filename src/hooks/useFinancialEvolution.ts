
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

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
      const startPeriod = subMonths(currentDate, periodMonths - 1);

      // Fazer todas as consultas em paralelo - muito mais eficiente
      const [
        { data: assets },
        { data: liabilities },
        { data: investments },
        { data: bankAccounts },
        { data: creditCardDebts }
      ] = await Promise.all([
        supabase
          .from('assets')
          .select('current_value, category, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startPeriod.toISOString()),
        
        supabase
          .from('liabilities')
          .select('remaining_amount, category, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startPeriod.toISOString()),
          
        supabase
          .from('investments')
          .select('current_value, amount, liquidity, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startPeriod.toISOString()),
          
        supabase
          .from('bank_accounts')
          .select('balance, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gte('created_at', startPeriod.toISOString()),
          
        supabase
          .from('credit_card_installments')
          .select('amount, bill_month')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .gte('bill_month', format(startPeriod, 'yyyy-MM-dd'))
      ]);

      // Processar dados para cada mês
      const data: FinancialEvolutionData[] = [];
      
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthEnd = endOfMonth(monthDate);
        const monthStart = startOfMonth(monthDate);
        
        // Filtrar dados até o final do mês
        const monthAssets = (assets || []).filter(a => 
          new Date(a.created_at) <= monthEnd
        );
        
        const monthLiabilities = (liabilities || []).filter(l => 
          new Date(l.created_at) <= monthEnd
        );
        
        const monthInvestments = (investments || []).filter(i => 
          new Date(i.created_at) <= monthEnd
        );
        
        const monthBankAccounts = (bankAccounts || []).filter(b => 
          new Date(b.created_at) <= monthEnd
        );
        
        const monthCreditCardDebts = (creditCardDebts || []).filter(c => {
          const billDate = new Date(c.bill_month);
          return billDate >= monthStart && billDate <= monthEnd;
        });

        // Calcular totais
        const totalAssets = [
          ...monthAssets.map(a => a.current_value),
          ...monthInvestments.map(i => i.current_value || i.amount),
          ...monthBankAccounts.map(b => b.balance)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        const totalLiabilities = [
          ...monthLiabilities.map(l => l.remaining_amount),
          ...monthCreditCardDebts.map(c => c.amount)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        // Calcular reservas líquidas
        const liquidReserves = [
          ...monthBankAccounts.map(b => b.balance),
          ...monthInvestments
            .filter(i => i.liquidity === 'daily' || i.liquidity === 'diaria')
            .map(i => i.current_value || i.amount)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        const netWorth = totalAssets - totalLiabilities;

        data.push({
          month: format(monthDate, 'MMM yyyy'),
          netWorth,
          totalDebt: totalLiabilities,
          liquidReserves,
          totalAssets,
          totalLiabilities
        });
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
