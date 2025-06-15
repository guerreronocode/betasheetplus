
import React from 'react';
// TODO: importar componentes de filtro/paginação conforme necessidade
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card } from '@/components/ui/card';

const TransactionsHistory = () => {
  const { income, expenses } = useFinancialData();
  // Combine
  const allTransactions = [
    ...income.map(item => ({ ...item, type: 'income' as const })),
    ...expenses.map(item => ({ ...item, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // TODO: Add filtros, paginação, totais agregados por mês/categoria

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="font-bold text-2xl mb-6">Histórico Completo de Transações</h1>
      <Card className="p-4">
        {allTransactions.length === 0 ? (
          <div className="text-gray-500 py-10 text-center">Nenhuma transação encontrada.</div>
        ) : (
          <div className="space-y-2">
            {allTransactions.map(transaction => (
              <div className="flex justify-between items-center border-b pb-2">
                <span>
                  {transaction.type === 'income' ? (
                    <span className="text-green-600 font-bold mr-2">+</span>
                  ) : (
                    <span className="text-red-600 font-bold mr-2">-</span>
                  )}
                  {transaction.description}
                  <span className="ml-4 text-xs text-gray-400">{transaction.category}</span>
                </span>
                <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionsHistory;
