import React from 'react';
import { Layout } from '@/components/Layout';
import { CreditCardManager } from '@/components/creditCard/CreditCardManager';

const CreditCards = () => {
  return (
    <Layout>
      <div className="p-4 max-w-7xl mx-auto">
        <CreditCardManager />
      </div>
    </Layout>
  );
};

export default CreditCards;