
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import QuickFinancialCards from '@/components/QuickFinancialCards';
import DebtManager from "@/components/debts/DebtManager";
import { RefactoredPlanningPanel } from '@/components/budget/RefactoredPlanningPanel';
import { GoalsSummary } from '@/components/goals/GoalsSummary';

const Dashboard = () => {

  return (
    <div className="min-h-screen bg-fnb-cream">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UpdatedQuickStats />
        </div>

        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 fnb-card">
            <TabsTrigger value="planning" className="flex-shrink-0 fnb-card hover:bg-fnb-accent/10">Planejamento</TabsTrigger>
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

          <TabsContent value="debts">
            <DebtManager />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
