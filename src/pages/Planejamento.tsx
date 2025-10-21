import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import QuickFinancialCards from '@/components/QuickFinancialCards';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { RefactoredPlanningPanel } from '@/components/budget/RefactoredPlanningPanel';

const Planejamento = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-fnb-cream">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-title font-bold text-fnb-ink">Orçamento & Projeção</h1>
              <p className="text-fnb-ink/70 mt-2">Gerencie seu orçamento e planeje seus gastos</p>
            </div>
            
            <div className="space-y-6">
              {/* Dois cards pequenos: % de renda gasta e projeção de saldo */}
              <QuickFinancialCards />
              
              {/* Resumo das Metas */}
              <GoalsSummary />
              
              <RefactoredPlanningPanel />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Planejamento;
