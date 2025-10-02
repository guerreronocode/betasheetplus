import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { usePlannedIncome } from './usePlannedIncome';
import { usePlannedExpenses } from './usePlannedExpenses';
import { useCreditCardBills } from './useCreditCardBills';
import { formatDateForDisplay } from '@/utils/formatters';

export interface PendingTransaction {
  id: string;
  type: 'planned_income' | 'planned_expense' | 'credit_bill';
  date: Date;
  category: string;
  subcategory?: string;
  account: string;
  description: string;
  value: number;
  status: 'pending' | 'overdue' | 'upcoming';
  original?: any;
}

export const usePendingTransactions = () => {
  const { user } = useAuth();
  const { plannedIncome } = usePlannedIncome();
  const { plannedExpenses } = usePlannedExpenses();
  const { upcomingBills, overdueBills } = useCreditCardBills();

  const { data: pendingTransactions = [], isLoading } = useQuery({
    queryKey: ['pending_transactions', user?.id, plannedIncome, plannedExpenses, upcomingBills, overdueBills],
    queryFn: async (): Promise<PendingTransaction[]> => {
      if (!user) return [];

      const pending: PendingTransaction[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Receitas planejadas
      if (plannedIncome && Array.isArray(plannedIncome)) {
        plannedIncome.forEach(income => {
          const incomeDate = new Date(income.month);
          incomeDate.setHours(0, 0, 0, 0);
          const status = incomeDate < today ? 'overdue' : (incomeDate.getTime() === today.getTime() ? 'pending' : 'upcoming');
          pending.push({
            id: `income-${income.id}`,
            type: 'planned_income' as const,
            date: incomeDate,
            category: income.category,
            account: 'A definir',
            description: income.description || 'Receita planejada',
            value: income.planned_amount,
            status: status as 'overdue' | 'upcoming' | 'pending',
            original: income
          });
        });
      }

      // 2. Despesas planejadas
      if (plannedExpenses && Array.isArray(plannedExpenses)) {
        plannedExpenses.forEach(expense => {
          const expenseDate = new Date(expense.month);
          expenseDate.setHours(0, 0, 0, 0);
          const status = expenseDate < today ? 'overdue' : (expenseDate.getTime() === today.getTime() ? 'pending' : 'upcoming');
          pending.push({
            id: `expense-${expense.id}`,
            type: 'planned_expense' as const,
            date: expenseDate,
            category: expense.category,
            account: 'A definir',
            description: expense.description || 'Despesa planejada',
            value: -expense.planned_amount,
            status: status as 'overdue' | 'upcoming' | 'pending',
            original: expense
          });
        });
      }

      // 3. Faturas de cartão
      if (upcomingBills && Array.isArray(upcomingBills) || overdueBills && Array.isArray(overdueBills)) {
        const allBills = [...(upcomingBills || []), ...(overdueBills || [])];
        allBills.forEach(bill => {
          const billDueDate = new Date(bill.due_date);
          billDueDate.setHours(0, 0, 0, 0);
          const status = billDueDate < today ? 'overdue' : (billDueDate.getTime() === today.getTime() ? 'pending' : 'upcoming');
          pending.push({
            id: `bill-${bill.id}`,
            type: 'credit_bill' as const,
            date: billDueDate,
            category: 'Cartão de Crédito',
            account: 'A pagar',
            description: `Fatura - Vencimento ${formatDateForDisplay(bill.due_date)}`,
            value: -bill.total_amount,
            status: status as 'overdue' | 'upcoming' | 'pending',
            original: bill
          });
        });
      }

      return pending.sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    pendingTransactions: pendingTransactions || [],
    isLoading
  };
};
