import React from 'react';
import { Layout } from '@/components/Layout';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import PatrimonySummaryOverview from '@/components/PatrimonySummaryOverview';

const FinancialAnalysis = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-fnb-ink">Análise Financeira</h1>
            <p className="text-fnb-ink/70 mt-1 text-sm">Acompanhe seu score, evolução e resumo patrimonial</p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-full">
            {/* Score da saúde financeira - Ocupa toda a largura */}
            <div className="w-full">
              <DetailedFinancialScore />
            </div>
            
            {/* Linha com Evolução Financeira e Patrimônio - Dividida em 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full">
                <FinancialEvolutionPanel />
              </div>
              
              <div className="w-full">
                <PatrimonySummaryOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default FinancialAnalysis;