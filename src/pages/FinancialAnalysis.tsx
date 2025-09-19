import React from 'react';
import { Layout } from '@/components/Layout';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import PatrimonySummaryOverview from '@/components/PatrimonySummaryOverview';

const FinancialAnalysis = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-fnb-ink">Análise Financeira</h1>
            <p className="text-fnb-ink/70 mt-2">Acompanhe seu score, evolução e resumo patrimonial</p>
          </div>

          <div className="space-y-6">
            {/* Score da saúde financeira */}
            <DetailedFinancialScore />
            
            {/* Evolução Financeira */}
            <FinancialEvolutionPanel />
            
            {/* Resumo dos patrimônios */}
            <PatrimonySummaryOverview />
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default FinancialAnalysis;