import React from 'react';
import { Layout } from '@/components/Layout';
import DebtManager from '@/components/debts/DebtManager';

const DebtsPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-title text-fnb-ink">Gestão de Dívidas</h1>
          <p className="text-fnb-ink/70 mt-2">
            Gerencie suas dívidas, simule quitações e acompanhe suas estratégias de pagamento
          </p>
        </div>
        <DebtManager />
      </div>
    </Layout>
  );
};

export default DebtsPage;
