import React from 'react';
import { Layout } from '@/components/Layout';
import PendingTransactionsTable from '@/components/PendingTransactionsTable';

const LancamentosPendencias = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fnb-ink mb-2">Pendências</h1>
          <p className="text-fnb-ink/70">Receitas e despesas programadas, faturas de cartão e transações recorrentes</p>
        </div>

        <PendingTransactionsTable />
      </div>
    </Layout>
  );
};

export default LancamentosPendencias;