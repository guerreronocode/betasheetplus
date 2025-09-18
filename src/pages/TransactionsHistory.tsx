
import React from 'react';
import { Layout } from '@/components/Layout';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BankStatementUpload from '@/components/BankStatementUpload';
import BankStatementHistory from '@/components/BankStatementHistory';

const TransactionsHistory = () => {
  const { income, expenses } = useFinancialData();
  // Combine
  const allTransactions = [
    ...income.map(item => ({ ...item, type: 'income' as const })),
    ...expenses.map(item => ({ ...item, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // TODO: Add filtros, paginação, totais agregados por mês/categoria

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="font-title text-2xl font-bold mb-6 text-fnb-ink">Transações</h1>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 fnb-card">
            <TabsTrigger value="upload" className="fnb-card hover:bg-fnb-accent/10">Upload de Extrato</TabsTrigger>
            <TabsTrigger value="history-uploads" className="fnb-card hover:bg-fnb-accent/10">Histórico de Uploads</TabsTrigger>
            <TabsTrigger value="all-transactions" className="fnb-card hover:bg-fnb-accent/10">Todas as Transações</TabsTrigger>
          </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <BankStatementUpload />
        </TabsContent>

        <TabsContent value="history-uploads" className="space-y-4">
          <BankStatementHistory />
        </TabsContent>

        <TabsContent value="all-transactions" className="space-y-4">
          <Card className="p-4 fnb-card">
            {allTransactions.length === 0 ? (
              <div className="text-fnb-ink/70 py-10 text-center font-body">
                Nenhuma transação encontrada.
              </div>
            ) : (
              <div className="space-y-2">
                {allTransactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center border-b border-fnb-accent/10 pb-2">
                    <span>
                      {transaction.type === 'income' ? (
                        <span className="text-fnb-secondary-green font-bold mr-2 font-mono">+</span>
                      ) : (
                        <span className="text-fnb-secondary-red font-bold mr-2 font-mono">-</span>
                      )}
                      <span className="font-body text-fnb-ink">{transaction.description}</span>
                      <span className="ml-4 text-xs text-fnb-ink/70 font-body">
                        {transaction.category}
                      </span>
                    </span>
                    <span className={`font-mono font-semibold ${
                      transaction.type === 'income' ? 'text-fnb-secondary-green' : 'text-fnb-secondary-red'
                    }`}>
                      R$ {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
};

export default TransactionsHistory;
