import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import TransactionsList from '@/components/TransactionsList';
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';
import RecurringTransactions from '@/components/RecurringTransactions';
import CategoryRanking from '@/components/CategoryRanking';
import BankStatementUpload from '@/components/BankStatementUpload';
import BankStatementHistory from '@/components/BankStatementHistory';

const Lancamentos = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fnb-ink mb-2">Lançamentos</h1>
          <p className="text-fnb-ink/70">Gerencie suas transações financeiras</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UnifiedTransactionForm />
            <TransferBetweenAccounts />
          </div>
          
          {/* Upload de Extrato Bancário */}
          <div className="fnb-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-fnb-ink">Extrato Bancário</h2>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload de Extrato</TabsTrigger>
                <TabsTrigger value="history">Histórico de Uploads</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-4">
                <BankStatementUpload />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <BankStatementHistory />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Ranking completo de categorias */}
          <CategoryRanking />
          
          <RecurringTransactions />
          <TransactionsList />
        </div>
      </div>
    </Layout>
  );
};

export default Lancamentos;