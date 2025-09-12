import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatDateForDisplay } from '@/utils/formatters';
import EditTransactionModal from './EditTransactionModal';

const TransactionsList = () => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p className="text-sm text-gray-600">Últimas entradas e saídas</p>
          </div>
        </div>
        <a href="/transactions-history" className="text-blue-600 hover:underline font-medium">
          Ver todas
        </a>
      </div>

      <div className="space-y-3">
        {allTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm">Adicione sua primeira receita ou despesa!</p>
          </div>
        ) : (
          allTransactions.slice(0, 10).map((transaction, index) => (
            <div
              key={`${transaction.type}-${transaction.id}`}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 animate-slide-up ${
                transaction.type === 'income'
                  ? 'border-green-200 bg-green-50 hover:border-green-300'
                  : 'border-red-200 bg-red-50 hover:border-red-300'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income'
                    ? 'bg-green-200 text-green-700'
                    : 'bg-red-200 text-red-700'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{formatDateForDisplay(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="hover:bg-gray-200 rounded p-1"
                  title="Editar"
                  onClick={() => handleEdit(transaction)}
                >
                  <Pencil className="w-4 h-4 text-blue-500" />
                </button>
                <EditTransactionModal
                  open={editModalOpen}
                  onOpenChange={handleCloseModal}
                  transaction={selectedTransaction}
                />
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionsList;
