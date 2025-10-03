import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import InvestmentOverviewChart from '@/components/Investment/InvestmentOverviewChart';
import { useInvestments } from '@/hooks/useInvestments';
import { Card } from '@/components/ui/card';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {investmentsLoading ? (
              <Card className="p-8 text-center">
                <p className="text-fnb-ink/70">Carregando investimentos...</p>
              </Card>
            ) : (
              <>
                <InvestmentOverviewChart 
                  investments={investments} 
                  selectedYear={selectedYear}
                />
                <InvestmentTableView 
                  investments={investments}
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default InvestmentsPage;
