
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

      // Buscar todos os dados uma vez só para otimizar
      const [
        { data: allAssets },
        { data: allLiabilities },
        { data: allInvestments },
        { data: allBankAccounts }
      ] = await Promise.all([
        supabase
          .from('assets')
          .select('current_value, category, created_at')
          .eq('user_id', user.id),
        
        supabase
          .from('liabilities')
          .select('remaining_amount, category, created_at')
          .eq('user_id', user.id),
          
        supabase
          .from('investments')
          .select('current_value, amount, liquidity, created_at')
          .eq('user_id', user.id),
          
        supabase
          .from('bank_accounts')
          .select('balance, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
      ]);

      // Calcular dados para cada mês no período selecionado
      for (let i = periodMonths - 1; i >= 0; i--) {
        const monthDate = subMonths(currentDate, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        // Filtrar dados até o final do mês
        const assets = (allAssets || []).filter(a => 
          new Date(a.created_at) <= monthEnd
        );
        
        const liabilities = (allLiabilities || []).filter(l => 
          new Date(l.created_at) <= monthEnd
        );
        
        const investments = (allInvestments || []).filter(i => 
          new Date(i.created_at) <= monthEnd
        );
        
        const bankAccounts = (allBankAccounts || []).filter(b => 
          new Date(b.created_at) <= monthEnd
        );

        // Buscar dívidas de cartão para o mês específico
        const { data: creditCardDebts } = await supabase
          .from('credit_card_installments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .gte('bill_month', monthStart.toISOString().split('T')[0])
          .lte('bill_month', monthEnd.toISOString().split('T')[0]);

        // Calcular totais
        const totalAssets = [
          ...assets.map(a => a.current_value),
          ...investments.map(i => i.current_value || i.amount),
          ...bankAccounts.map(b => b.balance)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        const totalLiabilities = [
          ...liabilities.map(l => l.remaining_amount),
          ...(creditCardDebts || []).map(c => c.amount)
        ].reduce((sum, val) => sum + (Number(val) || 0), 0);

        // Calcular reservas líquidas
        const liquidReserves = [
          ...bankAccounts.map(b => b.balance),
          ...investments
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
