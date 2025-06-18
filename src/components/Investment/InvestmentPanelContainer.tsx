
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus, Calculator } from 'lucide-react';
import { useInvestments } from '@/hooks/useInvestments';
import InvestmentCreateDialog from './InvestmentCreateDialog';
import InvestmentCalculatorDialog from './InvestmentCalculatorDialog';
import InvestmentList from './InvestmentList';
import InvestmentSummary from './InvestmentSummary';

const InvestmentPanelContainer: React.FC = () => {
  const { investments, investmentsLoading } = useInvestments();

  if (investmentsLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando investimentos...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciador de Investimentos
              </h3>
              <p className="text-sm text-gray-600">Gerencie e simule seus investimentos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <InvestmentCalculatorDialog />
            <InvestmentCreateDialog />
          </div>
        </div>
      </Card>

      {/* Summary */}
      {investments.length > 0 && <InvestmentSummary investments={investments} />}

      {/* Investment List */}
      <InvestmentList investments={investments} />
    </div>
  );
};

export default InvestmentPanelContainer;
