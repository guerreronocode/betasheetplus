
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus, Calculator } from 'lucide-react';
import { useInvestments } from '@/hooks/useInvestments';
import InvestmentCreateDialog from './InvestmentCreateDialog';
import InvestmentCalculatorDialog from './InvestmentCalculatorDialog';
import InvestmentList from './InvestmentList';
import InvestmentSummary from './InvestmentSummary';
import InvestmentEditDialog from './InvestmentEditDialog';
import InvestmentAportDialog from './InvestmentAportDialog';
import InvestmentUpdateDialog from './InvestmentUpdateDialog';
import InvestmentDeleteDialog from './InvestmentDeleteDialog';

const InvestmentPanelContainer: React.FC = () => {
  const { investments, investmentsLoading, updateInvestment, deleteInvestment, addInvestmentAport, updateInvestmentValue } = useInvestments();
  
  // Estados para os modais
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [aportingInvestment, setAportingInvestment] = useState(null);
  const [updatingInvestment, setUpdatingInvestment] = useState(null);
  const [deletingInvestment, setDeletingInvestment] = useState(null);

  // Calcular totais para o InvestmentSummary
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentInvestmentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
  const investmentReturn = currentInvestmentValue - totalInvested;

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
  };

  const handleDelete = (id: string) => {
    const investment = investments.find(inv => inv.id === id);
    setDeletingInvestment(investment);
  };

  const handleAport = (investment: any) => {
    setAportingInvestment(investment);
  };

  const handleUpdate = (investment: any) => {
    setUpdatingInvestment(investment);
  };

  const handleEditSubmit = (id: string, name: string) => {
    updateInvestment({ id, name });
    setEditingInvestment(null);
  };

  const handleAportSubmit = (investmentId: string, amount: number, currentValue: number, bankAccountId: string) => {
    addInvestmentAport(investmentId, amount, currentValue, bankAccountId, new Date());
    setAportingInvestment(null);
  };

  const handleUpdateSubmit = (investmentId: string, currentValue: number) => {
    updateInvestmentValue(investmentId, currentValue);
    setUpdatingInvestment(null);
  };

  const handleDeleteConfirm = (investmentId: string) => {
    deleteInvestment(investmentId);
    setDeletingInvestment(null);
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
        onAport={handleAport}
        onUpdate={handleUpdate}
      />

      {/* Modais */}
      <InvestmentEditDialog
        isOpen={!!editingInvestment}
        onClose={() => setEditingInvestment(null)}
        investment={editingInvestment}
        onEdit={handleEditSubmit}
      />

      <InvestmentAportDialog
        isOpen={!!aportingInvestment}
        onClose={() => setAportingInvestment(null)}
        investment={aportingInvestment}
        onAport={handleAportSubmit}
      />

      <InvestmentUpdateDialog
        isOpen={!!updatingInvestment}
        onClose={() => setUpdatingInvestment(null)}
        investment={updatingInvestment}
        onUpdate={handleUpdateSubmit}
      />

      <InvestmentDeleteDialog
        isOpen={!!deletingInvestment}
        onClose={() => setDeletingInvestment(null)}
        investment={deletingInvestment}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default InvestmentPanelContainer;
