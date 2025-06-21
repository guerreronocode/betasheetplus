
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

      const data: FinancialEvolutionData[] = [];
      const currentDate = new Date();

      // Calcular dados para cada mês no período selecionado
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthKey = format(monthDate, 'yyyy-MM');

        // Buscar ativos do mês
        const { data: assets } = await supabase
          .from('assets')
          .select('current_value, category')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());

        // Buscar passivos do mês
        const { data: liabilities } = await supabase
          .from('liabilities')
          .select('remaining_amount, category')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());

        // Buscar investimentos do mês
        const { data: investments } = await supabase
          .from('investments')
          .select('current_value, amount, liquidity, category')
          .eq('user_id', user.id)
          .lte('created_at', monthEnd.toISOString());

        // Buscar contas bancárias do mês
        const { data: bankAccounts } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lte('created_at', monthEnd.toISOString());

        // Calcular dívidas de cartão para o mês
        const { data: creditCardDebts } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .gte('bill_month', monthStart.toISOString().split('T')[0])
          .lte('bill_month', monthEnd.toISOString().split('T')[0]);

        // Calcular totais
        const totalAssets = [
          ...(assets || []).map(a => a.current_value),
          ...(investments || []).map(i => i.current_value || i.amount),
          ...(bankAccounts || []).map(b => b.balance)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        const totalLiabilities = [
          ...(liabilities || []).map(l => l.remaining_amount),
          ...(creditCardDebts || []).map(c => c.amount)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        // Calcular reservas líquidas (contas bancárias + investimentos líquidos)
        const liquidReserves = [
          ...(bankAccounts || []).map(b => b.balance),
          ...(investments || [])
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
