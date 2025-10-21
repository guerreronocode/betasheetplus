import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { GoalsManager } from '@/components/goals/GoalsManager';

const Metas = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-fnb-cream">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-title font-bold text-fnb-ink">Objetivos & Metas</h1>
              <p className="text-fnb-ink/70 mt-2">Defina e acompanhe suas metas financeiras</p>
            </div>
            <GoalsManager />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Metas;
