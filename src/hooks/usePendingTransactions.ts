import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRecurringTransactions } from './useRecurringTransactions';
import { usePlannedIncome } from './usePlannedIncome';
import { usePlannedExpenses } from './usePlannedExpenses';
import { useCreditCardBills } from './useCreditCardBills';

export interface PendingTransaction {
  id: string;
  type: 'recurring' | 'planned_income' | 'planned_expense' | 'credit_bill';
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
  const { recurringTransactions } = useRecurringTransactions();
  const { plannedIncome } = usePlannedIncome();
  const { plannedExpenses } = usePlannedExpenses();
  const { upcomingBills, overdueBills } = useCreditCardBills();

  console.log('usePendingTransactions - Data:', {
    user: !!user,
    recurringTransactions: recurringTransactions?.length || 0,
    plannedIncome: plannedIncome?.length || 0,
    plannedExpenses: plannedExpenses?.length || 0,
    upcomingBills: upcomingBills?.length || 0,
    overdueBills: overdueBills?.length || 0
  });

  const { data: pendingTransactions = [], isLoading } = useQuery({
    queryKey: ['pending_transactions', user?.id, recurringTransactions, plannedIncome, plannedExpenses, upcomingBills, overdueBills],
    queryFn: async (): Promise<PendingTransaction[]> => {
      if (!user) return [];

      const pending: PendingTransaction[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Transações recorrentes (sempre aparecem primeiro)
      console.log('Processing recurring transactions:', recurringTransactions);
      recurringTransactions
        .filter(t => t.is_active)
        .forEach(transaction => {
          console.log('Processing transaction:', transaction);
          // Calcular próxima data baseada na frequência
          const nextDate = calculateNextRecurringDate(transaction);
          console.log('Next date calculated:', nextDate);
          
          const pendingItem: PendingTransaction = {
            id: `recurring-${transaction.id}`,
            type: 'recurring' as const,
            date: nextDate,
            category: transaction.category,
            account: getBankAccountName(transaction.bank_account_id) || 'Conta não informada',
            description: transaction.description,
            value: transaction.type === 'income' ? transaction.amount : -transaction.amount,
            status: 'pending' as const,
            original: transaction
          };
          
          console.log('Adding pending item:', pendingItem);
          pending.push(pendingItem);
        });

      // 2. Receitas planejadas
      plannedIncome.forEach(income => {
        const incomeDate = new Date(income.month);
        if (incomeDate >= today) {
          pending.push({
            id: `income-${income.id}`,
            type: 'planned_income',
            date: incomeDate,
            category: income.category,
            account: 'A definir',
            description: income.description || 'Receita planejada',
            value: income.planned_amount,
            status: incomeDate < today ? 'overdue' : 'upcoming',
            original: income
          });
        }
      });

      // 3. Despesas planejadas
      plannedExpenses.forEach(expense => {
        const expenseDate = new Date(expense.month);
        if (expenseDate >= today) {
          pending.push({
            id: `expense-${expense.id}`,
            type: 'planned_expense',
            date: expenseDate,
            category: expense.category,
            account: 'A definir',
            description: expense.description || 'Despesa planejada',
            value: -expense.planned_amount,
            status: expenseDate < today ? 'overdue' : 'upcoming',
            original: expense
          });
        }
      });

      // 4. Faturas de cartão
      [...upcomingBills, ...overdueBills].forEach(bill => {
        pending.push({
          id: `bill-${bill.id}`,
          type: 'credit_bill',
          date: new Date(bill.due_date),
          category: 'Cartão de Crédito',
          account: 'A pagar',
          description: `Fatura - Cartão`,
          value: -bill.total_amount,
          status: new Date(bill.due_date) < today ? 'overdue' : 'upcoming',
          original: bill
        });
      });

      // Ordenar: recorrentes primeiro, depois por data
      const sorted = pending.sort((a, b) => {
        if (a.type === 'recurring' && b.type !== 'recurring') return -1;
        if (a.type !== 'recurring' && b.type === 'recurring') return 1;
        return a.date.getTime() - b.date.getTime();
      });
      
      console.log('Final pending transactions:', sorted);
      return sorted;
    },
    enabled: !!user,
  });

  return {
    pendingTransactions,
    isLoading
  };
};

const calculateNextRecurringDate = (transaction: any): Date => {
  const today = new Date();
  const startDate = new Date(transaction.start_date);
  let nextDate = new Date(startDate);

  // Se a data de início já passou, calcular próxima ocorrência
  if (startDate <= today) {
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (transaction.frequency) {
      case 'daily':
        nextDate.setDate(startDate.getDate() + daysSinceStart + 1);
        break;
      case 'weekly':
        const weeksSinceStart = Math.floor(daysSinceStart / 7);
        nextDate.setDate(startDate.getDate() + (weeksSinceStart + 1) * 7);
        break;
      case 'monthly':
        const monthsSinceStart = Math.floor(daysSinceStart / 30);
        nextDate.setMonth(startDate.getMonth() + monthsSinceStart + 1);
        break;
      case 'yearly':
        const yearsSinceStart = Math.floor(daysSinceStart / 365);
        nextDate.setFullYear(startDate.getFullYear() + yearsSinceStart + 1);
        break;
    }
  }

  return nextDate;
};

const getBankAccountName = (accountId?: string): string | null => {
  // TODO: Implementar busca do nome da conta
  // Por enquanto retorna null, será implementado quando necessário
  return null;
};