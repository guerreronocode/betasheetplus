import React from 'react';
import AdvancedInvestmentManager from '@/components/AdvancedInvestmentManager';
import ImprovedYieldRatesDisplay from '@/components/ImprovedYieldRatesDisplay';
import { useFinancialData } from '@/hooks/useFinancialData';

const InvestmentsPage = () => {
  const { yieldRates } = useFinancialData();

  return (
    <div className="min-h-screen bg-fnb-cream">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <AdvancedInvestmentManager />
          <ImprovedYieldRatesDisplay yieldRates={yieldRates} />
        </div>
      </main>
    </div>
  );
};

export default InvestmentsPage;
