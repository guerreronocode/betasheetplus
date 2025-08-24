
import React from 'react';
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
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="font-bold text-2xl mb-6">Transações</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload de Extrato</TabsTrigger>
          <TabsTrigger value="history-uploads">Histórico de Uploads</TabsTrigger>
          <TabsTrigger value="all-transactions">Todas as Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <BankStatementUpload />
        </TabsContent>

        <TabsContent value="history-uploads" className="space-y-4">
          <BankStatementHistory />
        </TabsContent>

        <TabsContent value="all-transactions" className="space-y-4">
          <Card className="p-4">
            {allTransactions.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center">
                Nenhuma transação encontrada.
              </div>
            ) : (
              <div className="space-y-2">
                {allTransactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <span>
                      {transaction.type === 'income' ? (
                        <span className="text-success font-bold mr-2">+</span>
                      ) : (
                        <span className="text-destructive font-bold mr-2">-</span>
                      )}
                      {transaction.description}
                      <span className="ml-4 text-xs text-muted-foreground">
                        {transaction.category}
                      </span>
                    </span>
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
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
  );
};

export default TransactionsHistory;
