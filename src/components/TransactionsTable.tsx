import React, { useState } from 'react';
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
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatDateForDisplay, formatCurrency } from '@/utils/formatters';
import EditTransactionModal from './EditTransactionModal';

const TransactionsTable = () => {
  const { income, expenses, isLoading } = useFinancialData();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  if (isLoading) {
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
  const allTransactions = [
    ...income.map(item => ({ ...item, type: 'income' as const })),
    ...expenses.map(item => ({ ...item, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          <TableRow>
            <TableHead className="w-[40px] text-xs">Tipo</TableHead>
            <TableHead className="text-xs">Descrição</TableHead>
            <TableHead className="text-xs">Categoria</TableHead>
            <TableHead className="text-xs">Data</TableHead>
            <TableHead className="text-right text-xs">Valor</TableHead>
            <TableHead className="w-[80px] text-xs">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-fnb-ink/70">
                <div>
                  <p>Nenhuma transação encontrada</p>
                  <p className="text-sm">Adicione sua primeira receita ou despesa!</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            allTransactions.map((transaction) => (
              <TableRow key={`${transaction.type}-${transaction.id}`}>
                <TableCell>
                  <div className="w-fit">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-fnb-ink text-sm">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-fnb-ink/70 text-sm">
                  {transaction.category}
                </TableCell>
                <TableCell className="text-fnb-ink/70 text-sm">
                  {formatDateForDisplay(transaction.date)}
                </TableCell>
                <TableCell className={`text-right font-semibold text-sm ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      className="p-1 h-8 w-8"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
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