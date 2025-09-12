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
    <Card className="p-6" style={{ background: 'var(--brand-ivory)', border: '1px solid rgba(9,34,32,.08)', boxShadow: 'var(--shadow-1)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--support-info-100)' }}>
            <Calendar className="w-6 h-6" style={{ color: 'var(--support-info-600)' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-ink)' }}>Transações Recentes</h3>
            <p className="text-sm" style={{ color: 'var(--brand-ink)', opacity: 0.7, fontFamily: 'var(--font-sans)' }}>Últimas entradas e saídas</p>
          </div>
        </div>
        <a href="/transactions-history" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-sans)' }}>
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
                  ? 'is-success'
                  : 'is-error'
              }`}
              style={{ animationDelay: `${index * 50}ms`, borderRadius: 'var(--radius-lg)' }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income'
                    ? 'is-success'
                    : 'is-error'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--brand-ink)', fontFamily: 'var(--font-sans)' }}>{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--brand-ink)', opacity: 0.7 }}>
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
                <p className="font-semibold fn-money" style={{ 
                  color: transaction.type === 'income' ? 'var(--support-success-600)' : 'var(--support-danger-600)',
                  fontFamily: 'var(--font-mono)'
                }}>
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
