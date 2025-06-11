
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import TransactionsList from '@/components/TransactionsList';
import AdvancedInvestmentManager from '@/components/AdvancedInvestmentManager';
import AdvancedGoalsPanel from '@/components/AdvancedGoalsPanel';
import AchievementsPanel from '@/components/AchievementsPanel';
import AdvancedAchievements from '@/components/AdvancedAchievements';
import BankAccountManager from '@/components/BankAccountManager';
import AddTransactionForm from '@/components/AddTransactionForm';
import ImprovedYieldRatesDisplay from '@/components/ImprovedYieldRatesDisplay';
import PatrimonyManager from '@/components/PatrimonyManager';
import LinkedGoalsManager from '@/components/LinkedGoalsManager';
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="patrimony">Patrimônio</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AddTransactionForm />
              <TransactionsList />
            </div>
            <ImprovedYieldRatesDisplay yieldRates={yieldRates} />
          </TabsContent>

          <TabsContent value="accounts">
            <BankAccountManager />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AddTransactionForm />
              </div>
              <div className="lg:col-span-2">
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

          <TabsContent value="goals">
            <LinkedGoalsManager />
          </TabsContent>

          <TabsContent value="patrimony">
            <PatrimonyManager />
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
