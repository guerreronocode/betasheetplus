import React from 'react';
import { Layout } from '@/components/Layout';
import { PurchaseStatusPanel } from '@/components/creditCard/PurchaseStatusPanel';

const PurchaseStatus = () => {
  return (
    <Layout>
      <div className="p-4 w-5/6 mx-auto">
        <PurchaseStatusPanel />
      </div>
    </Layout>
  );
};

export default PurchaseStatus;