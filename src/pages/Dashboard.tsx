
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
      
      {/* Hero Section */}
      <section className="relative py-12">
        {/* Formas orgânicas decorativas */}
        <div className="organic-shape absolute top-8 left-16 w-32 h-32 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="organic-shape absolute bottom-16 right-32 w-24 h-24 animate-float" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-hero animate-scale-in mb-8">
            <UpdatedQuickStats />
          </div>
        </div>
      </section>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="flex flex-wrap gap-2 p-2 rounded-full" style={{ 
              background: 'var(--surface)', 
              border: '1px solid rgba(196,214,58,.1)',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <TabsTrigger value="overview" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>✨ Visão Geral</TabsTrigger>
              <TabsTrigger value="planning" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>📊 Planejamento</TabsTrigger>
              <TabsTrigger value="accounts" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>🏦 Contas</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>💸 Transações</TabsTrigger>
              <TabsTrigger value="investments" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>📈 Investimentos</TabsTrigger>
              <TabsTrigger value="goals" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>🎯 Metas</TabsTrigger>
              <TabsTrigger value="patrimony" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>💰 Patrimônio</TabsTrigger>
              <TabsTrigger value="credit-cards" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>💳 Cartões</TabsTrigger>
              <TabsTrigger value="debts" className="rounded-full px-6 py-3 font-semibold transition-all" style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text)'
              }}>⚖️ Dívidas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Cards financeiros modernos */}
            <div className="animate-scale-in">
              <QuickFinancialCards />
            </div>
            
            {/* Score com design aprimorado */}
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <DetailedFinancialScore />
            </div>
            
            {/* Evolução com animação */}
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <FinancialEvolutionPanel />
            </div>
            
            {/* Resumo das metas */}
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <GoalsSummary />
            </div>
            
            {/* Patrimônio overview */}
            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <PatrimonySummaryOverview />
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <RefactoredPlanningPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <BankAccountManager />
          </TabsContent>

          <TabsContent value="transactions" className="mt-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="animate-scale-in">
                  <UnifiedTransactionForm />
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <TransferBetweenAccounts />
                </div>
              </div>
              
              {/* Upload de Extrato com design moderno */}
              <div className="card-hero animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  💾 Extrato Bancário
                </h2>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-full p-1" style={{ background: 'rgba(196,214,58,.1)' }}>
                    <TabsTrigger value="upload" className="rounded-full">Upload de Extrato</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-full">Histórico de Uploads</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="mt-6">
                    <BankStatementUpload />
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-6">
                    <BankStatementHistory />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Ranking e transações com espaçamento */}
              <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CategoryRanking />
              </div>
              
              <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <RecurringTransactions />
              </div>
              
              <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
                <TransactionsList />
              </div>
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
