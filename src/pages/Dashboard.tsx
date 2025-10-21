
import React from 'react';
import UpdatedQuickStats from '@/components/UpdatedQuickStats';
import DebtManager from "@/components/debts/DebtManager";

const Dashboard = () => {

  return (
    <div className="min-h-screen bg-fnb-cream">      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <UpdatedQuickStats />
        </div>

        <DebtManager />
      </main>
    </div>
  );
};

export default Dashboard;
