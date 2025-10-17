import React from 'react';
import { Layout } from '@/components/Layout';
import ImprovedPatrimonyManager from '@/components/ImprovedPatrimonyManager';

const PatrimonyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-fnb-ink">Gestão de Patrimônio</h1>
            <p className="text-fnb-ink/70 mt-2">Gerencie seus ativos e passivos</p>
          </div>
          
          <ImprovedPatrimonyManager />
        </main>
      </div>
    </Layout>
  );
};

export default PatrimonyPage;
