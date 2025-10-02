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
      console.log('🔍 [usePendingTransactions] User exists:', !!user);
      console.log('🔍 [usePendingTransactions] plannedIncome:', plannedIncome);
      console.log('🔍 [usePendingTransactions] plannedExpenses:', plannedExpenses);
      console.log('🔍 [usePendingTransactions] upcomingBills:', upcomingBills);
      console.log('🔍 [usePendingTransactions] overdueBills:', overdueBills);
      
      if (!user) {
        console.log('🚫 [usePendingTransactions] No user, returning empty array');
        return [];
      }

      const pending: PendingTransaction[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Receitas planejadas
      if (plannedIncome && Array.isArray(plannedIncome)) {
        plannedIncome.forEach(income => {
          const incomeDate = new Date(income.month);
          if (incomeDate >= today) {
            const status = incomeDate < today ? 'overdue' : 'upcoming';
            pending.push({
              id: `income-${income.id}`,
              type: 'planned_income' as const,
              date: incomeDate,
              category: income.category,
              account: 'A definir',
              description: income.description || 'Receita planejada',
              value: income.planned_amount,
              status: status as 'overdue' | 'upcoming',
              original: income
            });
          }
        });
      }

      // 2. Despesas planejadas
      if (plannedExpenses && Array.isArray(plannedExpenses)) {
        plannedExpenses.forEach(expense => {
          const expenseDate = new Date(expense.month);
          if (expenseDate >= today) {
            const status = expenseDate < today ? 'overdue' : 'upcoming';
            pending.push({
              id: `expense-${expense.id}`,
              type: 'planned_expense' as const,
              date: expenseDate,
              category: expense.category,
              account: 'A definir',
              description: expense.description || 'Despesa planejada',
              value: -expense.planned_amount,
              status: status as 'overdue' | 'upcoming',
              original: expense
            });
          }
        });
      }

      // 3. Faturas de cartão (usar due_date para filtro)
      if (upcomingBills && Array.isArray(upcomingBills) || overdueBills && Array.isArray(overdueBills)) {
        [...(upcomingBills || []), ...(overdueBills || [])].forEach(bill => {
          // Usar due_date como data de referência para a fatura
          const billDueDate = new Date(bill.due_date);
          const status = billDueDate < today ? 'overdue' : 'upcoming';
          pending.push({
            id: `bill-${bill.id}`,
            type: 'credit_bill' as const,
            date: billDueDate, // Usar due_date para ordenação e filtro
            category: 'Cartão de Crédito',
            account: 'A pagar',
            description: `Fatura - Vencimento ${formatDateForDisplay(bill.due_date)}`,
            value: -bill.total_amount,
            status: status as 'overdue' | 'upcoming',
            original: bill
          });
        });
      }

      // Ordenar por data
      const sorted = pending.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });
      
      console.log('✅ [usePendingTransactions] Final pending transactions:', sorted);
      console.log('✅ [usePendingTransactions] Total items found:', sorted.length);
      return sorted;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    pendingTransactions: pendingTransactions || [],
    isLoading
  };
};
