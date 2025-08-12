
import { useBankAccounts } from './useBankAccounts';
import { useIncome } from './useIncome';
import { useExpenses } from './useExpenses';
import { useInvestments } from './useInvestments';
import { useMarketData } from './useMarketData';
import { usePatrimony } from './usePatrimony';
import { calculateFinancialMetrics } from '@/utils/financialCalculations';

// Re-export all interfaces for backward compatibility
export type { IncomeEntry } from './useIncome';
export type { ExpenseEntry } from './useExpenses';
export type { Investment } from './useInvestments';
export type { BankAccount } from './useBankAccounts';
export type { YieldRate, AssetPrice } from './useMarketData';

export const useFinancialData = () => {
  const { 
    bankAccounts, 
    bankAccountsLoading, 
    addBankAccount, 
    isAddingBankAccount 
  } = useBankAccounts();

  const { 
    income, 
    incomeLoading, 
    addIncome, 
    isAddingIncome 
  } = useIncome();

  const { 
    expenses, 
    expensesLoading, 
    addExpense, 
    isAddingExpense 
  } = useExpenses();

  const { 
    investments, 
    investmentsLoading, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    isAddingInvestment 
  } = useInvestments();

  const { yieldRates, assetPrices } = useMarketData();
  const { assets, liabilities } = usePatrimony();

  // Calculate current investment value
  const currentInvestmentValue = investments.reduce((sum, item) => sum + item.current_value, 0);

  // Calculate financial metrics using the utility function
  const financialMetrics = calculateFinancialMetrics(
    income,
    expenses,
    investments,
    bankAccounts,
    currentInvestmentValue
  );

  const isLoading = incomeLoading || expensesLoading || investmentsLoading || bankAccountsLoading;

  return {
    // Data
    income,
    expenses,
    investments,
    bankAccounts,
    yieldRates,
    assetPrices,
    assets,
    liabilities,
    
    // Loading states
    isLoading,
    
    // Mutations
    addIncome,
    addExpense,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addBankAccount,
    
    // Mutation loading states
    isAddingIncome,
    isAddingExpense,
    isAddingInvestment,
    isAddingBankAccount,
    
    // Financial metrics
    ...financialMetrics,
  };
};
