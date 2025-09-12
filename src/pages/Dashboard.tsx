
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import QuickFinancialCards from '@/components/QuickFinancialCards';
import TransactionsList from '@/components/TransactionsList';
import AdvancedInvestmentManager from '@/components/AdvancedInvestmentManager';
import BankAccountManager from '@/components/BankAccountManager';
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm';
import ImprovedYieldRatesDisplay from '@/components/ImprovedYieldRatesDisplay';
import ImprovedPatrimonyManager from '@/components/ImprovedPatrimonyManager';
import PatrimonySummaryOverview from '@/components/PatrimonySummaryOverview';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';
import RecurringTransactions from '@/components/RecurringTransactions';
import DebtManager from "@/components/debts/DebtManager";
import { CreditCardManager } from '@/components/creditCard/CreditCardManager';
import CategoryRanking from '@/components/CategoryRanking';
import CategoryRankingCompact from '@/components/CategoryRankingCompact';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import FinancialScoreCard from '@/components/FinancialScoreCard';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import { RefactoredPlanningPanel } from '@/components/budget/RefactoredPlanningPanel';
import { GoalsManager } from '@/components/goals/GoalsManager';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { useFinancialData } from '@/hooks/useFinancialData';
import BankStatementUpload from '@/components/BankStatementUpload';
import BankStatementHistory from '@/components/BankStatementHistory';

const Dashboard = () => {
  const { yieldRates } = useFinancialData();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UpdatedQuickStats />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1" style={{ background: 'var(--brand-ivory)', border: '1px solid rgba(42,74,71,.06)' }}>
            <TabsTrigger value="overview" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Visão Geral</TabsTrigger>
            <TabsTrigger value="planning" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Planejamento</TabsTrigger>
            <TabsTrigger value="accounts" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Contas</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Transações</TabsTrigger>
            <TabsTrigger value="investments" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Investimentos</TabsTrigger>
            <TabsTrigger value="goals" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Metas</TabsTrigger>
            <TabsTrigger value="patrimony" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Patrimônio</TabsTrigger>
            <TabsTrigger value="credit-cards" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Cartões</TabsTrigger>
            <TabsTrigger value="debts" className="flex-shrink-0" style={{ color: 'var(--brand-ink)' }}>Dívidas</TabsTrigger>
            
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dois cards pequenos: % de renda gasta e projeção de saldo */}
            <QuickFinancialCards />
            
            {/* Score da saúde financeira */}
            <DetailedFinancialScore />
            
            {/* Evolução Financeira */}
            <FinancialEvolutionPanel />
            
            {/* Resumo das Metas */}
            <GoalsSummary />
            
            {/* Resumo dos patrimônios */}
            <PatrimonySummaryOverview />
          </TabsContent>

          <TabsContent value="planning">
            <RefactoredPlanningPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <BankAccountManager />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UnifiedTransactionForm />
                <TransferBetweenAccounts />
              </div>
              
              {/* Upload de Extrato Bancário */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-ink)' }}>Extrato Bancário</h2>
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

          <TabsContent value="credit-cards">
            <CreditCardManager />
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
