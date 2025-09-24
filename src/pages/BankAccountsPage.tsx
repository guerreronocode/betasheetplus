import React from 'react';
import { Layout } from '@/components/Layout';
import BankAccountManager from '@/components/BankAccountManager';

const BankAccountsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-fnb-ink">Gestão de Contas</h1>
            <p className="text-fnb-ink/70 mt-2">Gerencie suas contas bancárias e visualize saldos</p>
          </div>
          
          <BankAccountManager />
        </main>
      </div>
    </Layout>
  );
};

export default BankAccountsPage;