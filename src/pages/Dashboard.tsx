
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import QuickFinancialCards from '@/components/QuickFinancialCards';
import TransactionsList from '@/components/TransactionsList';
import AdvancedInvestmentManager from '@/components/AdvancedInvestmentManager';
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm';
import ImprovedYieldRatesDisplay from '@/components/ImprovedYieldRatesDisplay';
import ImprovedPatrimonyManager from '@/components/ImprovedPatrimonyManager';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';
import RecurringTransactions from '@/components/RecurringTransactions';
import DebtManager from "@/components/debts/DebtManager";
import CategoryRanking from '@/components/CategoryRanking';
import { RefactoredPlanningPanel } from '@/components/budget/RefactoredPlanningPanel';
import { GoalsManager } from '@/components/goals/GoalsManager';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { useFinancialData } from '@/hooks/useFinancialData';
import BankStatementUpload from '@/components/BankStatementUpload';
import BankStatementHistory from '@/components/BankStatementHistory';

const Dashboard = () => {
  const { yieldRates } = useFinancialData();

  return (
    <div className="min-h-screen bg-fnb-cream">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UpdatedQuickStats />
        </div>

        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 fnb-card">
            <TabsTrigger value="planning" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Planejamento</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Transações</TabsTrigger>
            <TabsTrigger value="investments" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Investimentos</TabsTrigger>
            <TabsTrigger value="goals" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Metas</TabsTrigger>
            <TabsTrigger value="patrimony" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Patrimônio</TabsTrigger>
            <TabsTrigger value="debts" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Dívidas</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <div className="space-y-6">
              {/* Dois cards pequenos: % de renda gasta e projeção de saldo */}
              <QuickFinancialCards />
              
              {/* Resumo das Metas */}
              <GoalsSummary />
              
              <RefactoredPlanningPanel />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UnifiedTransactionForm />
                <TransferBetweenAccounts />
              </div>
              
              {/* Upload de Extrato Bancário */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Extrato Bancário</h2>
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
          </TabsContent>

          <TabsContent value="investments">
            <div className="space-y-6">
              <AdvancedInvestmentManager />
              <ImprovedYieldRatesDisplay yieldRates={yieldRates} />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsManager />
          </TabsContent>

          <TabsContent value="patrimony">
            <ImprovedPatrimonyManager />
          </TabsContent>

          <TabsContent value="debts">
            <DebtManager />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
