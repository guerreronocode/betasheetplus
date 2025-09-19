import React from 'react';
import { Layout } from '@/components/Layout';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import PatrimonySummaryOverview from '@/components/PatrimonySummaryOverview';

const FinancialAnalysis = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-fnb-ink">Análise Financeira</h1>
            <p className="text-fnb-ink/70 mt-1 text-xs">Score, evolução e resumo patrimonial</p>
          </div>

          <div className="grid grid-cols-1 gap-3 max-w-full">
            {/* Score da saúde financeira - Ocupa toda a largura */}
            <div className="w-full">
              <DetailedFinancialScore />
            </div>
            
            {/* Linha com Evolução Financeira e Patrimônio - 3/5 e 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-3">
                <FinancialEvolutionPanel />
              </div>
              
              <div className="lg:col-span-2">
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