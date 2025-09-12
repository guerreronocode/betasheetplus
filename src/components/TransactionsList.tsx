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
    <div className="card animate-scale-in relative overflow-hidden">
      {/* Forma orgânica decorativa */}
      <div className="organic-shape absolute top-4 right-4 w-12 h-12 opacity-20"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl shadow-sm" style={{ background: 'var(--support-info-100)' }}>
            <Calendar className="w-7 h-7" style={{ color: 'var(--support-info)' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              💸 Transações Recentes
            </h3>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Últimas entradas e saídas
            </p>
          </div>
        </div>
        <button className="btn-secondary text-sm px-4 py-2" style={{ 
          background: 'var(--brand-primary)', 
          color: 'var(--brand-ink)',
          border: 'none',
          textDecoration: 'none'
        }}>
          Ver todas →
        </button>
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
              className="flex items-center justify-between p-5 rounded-2xl transition-all duration-300 animate-scale-in border-2"
              style={{ 
                animationDelay: `${index * 50}ms`,
                borderRadius: 'var(--radius-organic)',
                background: transaction.type === 'income' 
                  ? 'linear-gradient(135deg, var(--support-success-100), rgba(39,174,96,.05))'
                  : 'linear-gradient(135deg, var(--support-danger-100), rgba(232,90,79,.05))',
                borderColor: transaction.type === 'income'
                  ? 'var(--support-success-200)'
                  : 'var(--support-danger-200)',
                marginBottom: '0.75rem'
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl shadow-sm" style={{
                  background: transaction.type === 'income'
                    ? 'var(--support-success)'
                    : 'var(--support-danger)',
                  color: 'white'
                }}>
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-base" style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-medium">{transaction.category}</span>
                    <span>•</span>
                    <span>{formatDateForDisplay(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="p-2 rounded-full transition-all hover:bg-white/50"
                  title="Editar"
                  onClick={() => handleEdit(transaction)}
                >
                  <Pencil className="w-4 h-4" style={{ color: 'var(--support-info)' }} />
                </button>
                
                <div className="text-right">
                  <p className="text-xl font-bold fn-money" style={{ 
                    color: transaction.type === 'income' ? 'var(--support-success)' : 'var(--support-danger)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
