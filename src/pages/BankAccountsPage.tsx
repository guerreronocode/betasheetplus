import React from 'react';
import { Layout } from '@/components/Layout';
import BankAccountManager from '@/components/BankAccountManager';

const BankAccountsPage = () => {
  return (
    <Layout>
      <div className="h-screen bg-fnb-cream flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 w-full">
          <BankAccountManager />
        </main>
      </div>
    </Layout>
  );
};

export default BankAccountsPage;