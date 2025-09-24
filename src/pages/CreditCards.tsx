import React from 'react';
import { Layout } from '@/components/Layout';
import { CreditCardManager } from '@/components/creditCard/CreditCardManager';

const CreditCards = () => {
  return (
    <Layout>
      <div className="p-4 w-4/6 mx-auto">
        <CreditCardManager />
      </div>
    </Layout>
  );
};

export default CreditCards;