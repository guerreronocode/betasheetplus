
import { useQuery } from '@tanstack/react-query';
import { useFinancialData } from './useFinancialData';
import { useDebts } from '@/modules/debts/hooks/useDebts';
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

  const { data: scoreDetails, isLoading: scoreLoading } = useQuery({
    queryKey: ['financial-score', income, expenses, investments, bankAccounts, debts],
    queryFn: (): ScoreDetails => {
      return FinancialScoreService.calculateScore({
        income,
        expenses,
        investments,
        bankAccounts,
        debts: debts || [],
        emergencyReserveTarget: 0,
        emergencyReserveCurrent: 0,
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
