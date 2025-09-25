import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CreditCardManager } from '@/components/creditCard/CreditCardManager';

const CreditCards = () => {
  return (
    <Layout>
      <div className="p-4 w-5/6 mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/credit-cards/cards" replace />} />
          <Route path="/cards" element={<CreditCardManager />} />
          <Route path="/purchase-status" element={<CreditCardManager />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default CreditCards;