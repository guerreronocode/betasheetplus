
import { IncomeEntry, ExpenseEntry, Investment, BankAccount } from '../hooks/useFinancialData';

export const calculateFinancialMetrics = (
  income: IncomeEntry[],
  expenses: ExpenseEntry[],
  investments: Investment[],
  bankAccounts: BankAccount[],
  currentInvestmentValue: number
) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter monthly data by actual transaction date
  const monthlyIncome = income
    .filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpenses = expenses
    .filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Correct net worth calculation: bank balances + current investment value
  const netWorth = totalBankBalance + currentInvestmentValue;
  
  // Available balance is the sum of all bank account balances
  const availableBalance = totalBankBalance;
  
  // Investment return
  const investmentReturn = currentInvestmentValue - totalInvested;

  return {
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    totalInvested,
    currentInvestmentValue,
    availableBalance,
    netWorth,
    investmentReturn,
  };
};
