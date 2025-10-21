import React from 'react';
import { Layout } from '@/components/Layout';
import { GoalsManager } from '@/components/goals/GoalsManager';

const Metas = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-title font-bold text-fnb-ink">Objetivos & Metas</h1>
            <p className="text-fnb-ink/70 mt-2">Defina e acompanhe suas metas financeiras</p>
          </div>
          <GoalsManager />
        </main>
      </div>
    </Layout>
  );
};

export default Metas;
