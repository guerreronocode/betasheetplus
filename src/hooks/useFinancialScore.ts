
import { useQuery } from '@tanstack/react-query';
import { useFinancialData } from './useFinancialData';
import { useDebts } from '@/modules/debts/hooks/useDebts';
import { useInvestmentPlanner } from './useInvestmentPlanner';
import { FinancialScoreService, ScoreDetails } from '@/services/financialScoreService';

export const useFinancialScore = () => {
  const { 
    income, 
    expenses, 
    investments, 
    bankAccounts, 
    isLoading: financialLoading 
  } = useFinancialData();
  
  const { debts, isLoading: debtsLoading } = useDebts();
  const { plan } = useInvestmentPlanner();

  const { data: scoreDetails, isLoading: scoreLoading } = useQuery({
    queryKey: ['financial-score', income, expenses, investments, bankAccounts, debts, plan],
    queryFn: (): ScoreDetails => {
      return FinancialScoreService.calculateScore({
        income,
        expenses,
        investments,
        bankAccounts,
        debts: debts || [],
        emergencyReserveTarget: plan?.emergency_reserve_target || 0,
        emergencyReserveCurrent: plan?.emergency_reserve_current || 0,
      });
    },
    enabled: !financialLoading && !debtsLoading,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    scoreDetails,
    isLoading: financialLoading || debtsLoading || scoreLoading,
  };
};
