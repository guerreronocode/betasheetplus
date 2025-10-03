import React from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import { useInvestments } from '@/hooks/useInvestments';
import { Card } from '@/components/ui/card';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();

  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-title text-fnb-ink mb-2">Investimentos</h1>
              <p className="text-fnb-ink/70">Visualização mensal dos seus investimentos</p>
            </div>
            
            {investmentsLoading ? (
              <Card className="p-8 text-center">
                <p className="text-fnb-ink/70">Carregando investimentos...</p>
              </Card>
            ) : (
              <InvestmentTableView investments={investments} />
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default InvestmentsPage;
