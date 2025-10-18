import React from 'react';
import { Layout } from '@/components/Layout';
import ImprovedPatrimonyManager from '@/components/ImprovedPatrimonyManager';

const PatrimonyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">      
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ImprovedPatrimonyManager />
        </main>
      </div>
    </Layout>
  );
};

export default PatrimonyPage;
