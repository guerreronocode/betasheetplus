import React from 'react';
import { Layout } from '@/components/Layout';
import DetailedFinancialScore from '@/components/DetailedFinancialScore';
import FinancialEvolutionPanel from '@/components/FinancialEvolutionPanel';
import PatrimonySummaryOverview from '@/components/PatrimonySummaryOverview';

const FinancialAnalysis = () => {
  return (
    <Layout>
      <div className="bg-fnb-cream">      
        <main className="max-w-8xl mx-auto px-4 py-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-fnb-ink">Análise Financeira</h1>
          </div>

          <div className="grid grid-cols-1 gap-2 max-w-full">
            {/* Score da saúde financeira - Ocupa toda a largura */}
            <div className="w-full">
              <DetailedFinancialScore />
            </div>
            
            {/* Linha com Evolução Financeira e Patrimônio - 3/5 e 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
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