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
  
  console.log('🚀 [usePendingTransactions] Hook called', {
    user: !!user,
    userId: user?.id
  });

  console.log('usePendingTransactions - Data:', {
    user: !!user,
    plannedIncome: plannedIncome?.length || 0,
    plannedExpenses: plannedExpenses?.length || 0,
    upcomingBills: upcomingBills?.length || 0,
    overdueBills: overdueBills?.length || 0
  });

  const { data: pendingTransactions = [], isLoading } = useQuery({
    queryKey: ['pending_transactions', user?.id, plannedIncome, plannedExpenses, upcomingBills, overdueBills],
    queryFn: async (): Promise<PendingTransaction[]> => {
      console.log('🔍 [usePendingTransactions] Query function executing');
      
      if (!user) {
        console.log('🚫 [usePendingTransactions] No user, returning empty array');
        return [];
      }

      const pending: PendingTransaction[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      console.log('📅 [usePendingTransactions] Today:', todayStr);

      // 1. Receitas planejadas (future only)
      if (plannedIncome && Array.isArray(plannedIncome)) {
        console.log('💰 [usePendingTransactions] Processing', plannedIncome.length, 'planned income');
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

      // 2. Despesas planejadas (future only)
      if (plannedExpenses && Array.isArray(plannedExpenses)) {
        console.log('💸 [usePendingTransactions] Processing', plannedExpenses.length, 'planned expenses');
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
        console.log('💳 [usePendingTransactions] Processing', allBills.length, 'credit card bills');
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

      // Ordenar por data
      const sorted = pending.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      console.log('✅ [usePendingTransactions] Total pending transactions:', sorted.length);
      return sorted;
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
