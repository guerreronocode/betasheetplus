import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowUpCircle, ArrowDownCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatDateForDisplay, formatCurrency } from '@/utils/formatters';
import EditTransactionModal from './EditTransactionModal';

type SortField = 'description' | 'category' | 'date' | 'amount' | 'type';
type SortOrder = 'asc' | 'desc';

const TransactionsTable = () => {
  const { income, expenses, isLoading } = useFinancialData();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Debug logs
  console.log('TransactionsTable - Debug:', {
    income: income ? income.length : 'null/undefined',
    expenses: expenses ? expenses.length : 'null/undefined',
    isLoading,
  });

  if (isLoading) {
    console.log('TransactionsTable - Showing loading state');
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Combine and sort all transactions
  const allTransactions = useMemo(() => {
    // Garantir que income e expenses são arrays válidos
    const safeIncome = Array.isArray(income) ? income : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    
    // Return empty array if loading
    if (isLoading) {
      return [];
    }
    
    const combined = [
      ...safeIncome.map(item => ({ ...item, type: 'income' as const })),
      ...safeExpenses.map(item => ({ ...item, type: 'expense' as const }))
    ];

    return combined.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Special handling for different field types
      if (sortField === 'date') {
        aValue = new Date(a.date || 0).getTime();
        bValue = new Date(b.date || 0).getTime();
      } else if (sortField === 'amount') {
        aValue = Number(a.amount || 0);
        bValue = Number(b.amount || 0);
      } else if (sortField === 'type') {
        aValue = a.type || '';
        bValue = b.type || '';
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [income, expenses, sortField, sortOrder, isLoading]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 text-sm h-10 px-3"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortOrder === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <Card className="fnb-card">
      <Table>
        <TableHeader>
          <TableRow className="h-10">
            <SortableHeader field="type">Tipo</SortableHeader>
            <SortableHeader field="description">Descrição</SortableHeader>
            <SortableHeader field="category">Categoria</SortableHeader>
            <SortableHeader field="date">Data</SortableHeader>
            <SortableHeader field="amount">
              <div className="text-right">Valor</div>
            </SortableHeader>
            <TableHead className="w-[70px] text-sm h-10 px-3">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-fnb-ink/70">
                <div>
                  <p className="text-sm">Nenhuma transação encontrada</p>
                  <p className="text-xs">Adicione sua primeira receita ou despesa!</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            allTransactions.map((transaction) => (
              <TableRow key={`${transaction.type}-${transaction.id}`} className="h-12">
                <TableCell className="px-3 py-2">
                  <div className="w-fit">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-fnb-ink text-sm px-3 py-2">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-fnb-ink/70 text-sm px-3 py-2">
                  {transaction.category}
                </TableCell>
                <TableCell className="text-fnb-ink/70 text-sm px-3 py-2">
                  {formatDateForDisplay(transaction.date)}
                </TableCell>
                <TableCell className={`text-right font-semibold text-sm px-3 py-2 ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(transaction)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <EditTransactionModal
        open={editModalOpen}
        onOpenChange={handleCloseModal}
        transaction={selectedTransaction}
      />
    </Card>
  );
};

export default TransactionsTable;