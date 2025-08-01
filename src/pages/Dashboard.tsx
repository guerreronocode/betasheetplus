
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import TransactionsList from '@/components/TransactionsList';
import AdvancedInvestmentManager from '@/components/AdvancedInvestmentManager';
import AdvancedGoalsPanel from '@/components/AdvancedGoalsPanel';
import AdvancedAchievements from '@/components/AdvancedAchievements';
import BankAccountManager from '@/components/BankAccountManager';
import AddTransactionForm from '@/components/AddTransactionForm';
import ImprovedYieldRatesDisplay from '@/components/ImprovedYieldRatesDisplay';
import ImprovedPatrimonyManager from '@/components/ImprovedPatrimonyManager';
import LinkedGoalsManager from '@/components/LinkedGoalsManager';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';
import RecurringTransactions from '@/components/RecurringTransactions';
import DebtManager from "@/components/debts/DebtManager";
import { CreditCardManager } from '@/components/creditCard/CreditCardManager';
import CategoryRanking from '@/components/CategoryRanking';
import CategoryRankingCompact from '@/components/CategoryRankingCompact';
import MonthlyObjectivesPanel from '@/components/MonthlyObjectivesPanel';
import BudgetPanel from '@/components/BudgetPanel';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import InvestmentPlanner from '@/components/InvestmentPlanner';
import FinancialScoreCard from '@/components/FinancialScoreCard';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import { BudgetProjectionPanel } from '@/components/budget/BudgetProjectionPanel';
import { useFinancialData } from '@/hooks/useFinancialData';

const Dashboard = () => {
  const { yieldRates } = useFinancialData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UpdatedQuickStats />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted">
            <TabsTrigger value="overview" className="flex-shrink-0">Visão Geral</TabsTrigger>
            <TabsTrigger value="score" className="flex-shrink-0">Score</TabsTrigger>
            <TabsTrigger value="evolution" className="flex-shrink-0">Evolução</TabsTrigger>
            <TabsTrigger value="objectives" className="flex-shrink-0">Objetivos</TabsTrigger>
            <TabsTrigger value="planning" className="flex-shrink-0">Planejamento</TabsTrigger>
            <TabsTrigger value="planner" className="flex-shrink-0">Planejador</TabsTrigger>
            <TabsTrigger value="accounts" className="flex-shrink-0">Contas</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0">Transações</TabsTrigger>
            <TabsTrigger value="investments" className="flex-shrink-0">Investimentos</TabsTrigger>
            <TabsTrigger value="goals" className="flex-shrink-0">Metas</TabsTrigger>
            <TabsTrigger value="patrimony" className="flex-shrink-0">Patrimônio</TabsTrigger>
            <TabsTrigger value="credit-cards" className="flex-shrink-0">Cartões</TabsTrigger>
            <TabsTrigger value="debts" className="flex-shrink-0">Dívidas</TabsTrigger>
            <TabsTrigger value="achievements" className="flex-shrink-0">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score de Saúde Financeira - destaque principal */}
              <div className="lg:col-span-2">
                <FinancialScoreCard />
              </div>
              
              {/* Widget compacto do ranking */}
              <div>
                <CategoryRankingCompact />
              </div>
            </div>
            
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao seu Dashboard Financeiro!</h2>
              <p className="text-gray-600 mb-8">Gerencie suas finanças de forma inteligente e organizada.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900">💰 Contas</h3>
                  <p className="text-sm text-blue-700">Gerencie suas contas bancárias</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900">📊 Transações</h3>
                  <p className="text-sm text-green-700">Controle receitas e despesas</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900">📈 Investimentos</h3>
                  <p className="text-sm text-purple-700">Acompanhe seus investimentos</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900">🎯 Metas</h3>
                  <p className="text-sm text-orange-700">Defina e alcance objetivos</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900">🚀 Planejador</h3>
                  <p className="text-sm text-red-700">Plano de investimento personalizado</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="score">
            <DetailedFinancialScore />
          </TabsContent>

          <TabsContent value="evolution">
            <FinancialEvolutionPanel />
          </TabsContent>

          <TabsContent value="objectives">
            <MonthlyObjectivesPanel />
          </TabsContent>

          <TabsContent value="planning">
            <div className="space-y-6">
              <BudgetPanel />
              <BudgetProjectionPanel />
            </div>
          </TabsContent>

          <TabsContent value="planner">
            <InvestmentPlanner />
          </TabsContent>

          <TabsContent value="accounts">
            <BankAccountManager />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AddTransactionForm />
                <TransferBetweenAccounts />
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

          <TabsContent value="goals">
            <LinkedGoalsManager />
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

          <TabsContent value="achievements">
            <AdvancedAchievements />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
