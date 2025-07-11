
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
  const { investments, investmentsLoading, updateInvestment, deleteInvestment } = useInvestments();

  // Calcular totais para o InvestmentSummary
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentInvestmentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
  const investmentReturn = currentInvestmentValue - totalInvested;

  const handleEdit = (investment: any) => {
    // Implementar lógica de edição se necessário
    console.log('Edit investment:', investment);
  };

  const handleDelete = (id: string) => {
    deleteInvestment(id);
  };

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
      {investments.length > 0 && (
        <InvestmentSummary 
          totalInvested={totalInvested}
          currentInvestmentValue={currentInvestmentValue}
          investmentReturn={investmentReturn}
        />
      )}

      {/* Investment List */}
      <InvestmentList 
        investments={investments}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InvestmentPanelContainer;
