
import React, { useState } from "react";
import { FolderOpen, Wallet, Plus, Edit, Trash2, Calculator, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebts } from "@/modules/debts/hooks/useDebts";
import { DebtFormData, DebtFormFactory } from "@/services/debtService";
import { formatCurrency } from "@/utils/formatters";
import DebtForm from "@/modules/debts/components/DebtForm";
import EarlyPayoffSimulator from "./EarlyPayoffSimulator";
import DebtPayoffSimulator from "./DebtPayoffSimulator";
import DebtPayoffTracker from "./DebtPayoffTracker";

type ViewMode = 'list' | 'form' | 'early-payoff' | 'payoff-simulator' | 'payoff-tracker';

const DebtManager: React.FC = () => {
  const { 
    debts, 
    isLoading, 
    totalDebts, 
    totalInterest,
    addDebt, 
    updateDebt, 
    deleteDebt,
    markAsPaid,
    isAddingDebt,
    isUpdatingDebt,
    isMarkingAsPaid
  } = useDebts();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [simulatingDebt, setSimulatingDebt] = useState<any>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const handleSubmit = (formData: DebtFormData) => {
    if (editingDebt) {
      updateDebt({ id: editingDebt.id, formData });
    } else {
      addDebt(formData);
    }
    setViewMode('list');
    setEditingDebt(null);
  };

  const handleEdit = (debt: any) => {
    setEditingDebt(debt);
    setViewMode('form');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingDebt(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'renegotiated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paid': return 'Quitada';
      case 'overdue': return 'Em atraso';
      case 'renegotiated': return 'Renegociada';
      default: return status;
    }
  };

  const handleSimulate = (debt: any) => {
    setSimulatingDebt(debt);
    setViewMode('early-payoff');
  };

  const handleMarkAsPaid = (debtId?: string) => {
    const id = debtId || simulatingDebt?.id;
    if (id) {
      markAsPaid(id);
      if (viewMode === 'early-payoff') {
        setViewMode('list');
        setSimulatingDebt(null);
      }
    }
  };

  const activeDebts = debts.filter(debt => debt.status === 'active');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando dívidas...</div>
      </Card>
    );
  }

  // Renderização condicional baseada no modo de visualização
  switch (viewMode) {
    case 'form':
      return (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingDebt ? 'Atualize os dados da dívida' : 'Cadastre uma nova dívida'}
                </p>
              </div>
            </div>
          </div>

          <DebtForm
            initialData={editingDebt ? DebtFormFactory.createEditForm(editingDebt) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isAddingDebt || isUpdatingDebt}
            isEdit={!!editingDebt}
          />
        </Card>
      );

    case 'early-payoff':
      return (
        <EarlyPayoffSimulator
          debt={simulatingDebt}
          onBack={() => setViewMode('list')}
          onMarkAsPaid={() => handleMarkAsPaid()}
          isMarkingAsPaid={isMarkingAsPaid}
        />
      );

    case 'payoff-simulator':
      return (
        <DebtPayoffSimulator
          debts={debts}
          onBackToManager={() => setViewMode('list')}
        />
      );

    case 'payoff-tracker':
      return (
        <DebtPayoffTracker
          debts={debts}
          selectedStrategy={selectedStrategy}
          onBackToSimulator={() => setViewMode('payoff-simulator')}
          onMarkAsPaid={handleMarkAsPaid}
        />
      );

    default: // 'list'
      return (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Gerenciador de Dívidas
                </h3>
                <p className="text-sm text-gray-600">Controle e analise suas dívidas</p>
              </div>
            </div>
            <div className="flex gap-2">
              {activeDebts.length >= 2 && (
                <Button 
                  onClick={() => setViewMode('payoff-simulator')}
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Simulador de Quitação
                </Button>
              )}
              <Button onClick={() => setViewMode('form')} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Dívida
              </Button>
            </div>
          </div>

          {/* Resumo */}
          {debts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-sm text-gray-600">Total de Dívidas</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDebts)}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Total de Juros</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalInterest)}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Número de Dívidas</div>
                <div className="text-2xl font-bold text-blue-600">
                  {debts.length}
                </div>
              </Card>
            </div>
          )}

          {/* Simulador de Estratégias - Destaque */}
          {activeDebts.length >= 2 && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">
                      🚀 Simulador de Quitação Inteligente
                    </h4>
                    <p className="text-sm text-green-700">
                      Compare as estratégias "Bola de Neve" e "Avalanche" para eliminar suas dívidas de forma otimizada
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setViewMode('payoff-simulator')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Começar Simulação
                </Button>
              </div>
            </Card>
          )}

          {/* Lista de Dívidas */}
          <div className="space-y-4">
            {debts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma dívida cadastrada</p>
                <p className="text-sm">Clique em "Nova Dívida" para começar</p>
              </div>
            ) : (
              debts.map(debt => (
                <Card key={debt.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {debt.creditor}
                        </h4>
                        <Badge className={getStatusColor(debt.status)}>
                          {getStatusLabel(debt.status)}
                        </Badge>
                        {debt.category && (
                          <Badge variant="outline">
                            {debt.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{debt.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Saldo Devedor:</span>
                          <div className="font-semibold text-red-600">
                            {formatCurrency(debt.remaining_balance)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Parcelas:</span>
                          <div className="font-semibold">
                            {debt.paid_installments}/{debt.total_installments}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor Parcela:</span>
                          <div className="font-semibold">
                            {formatCurrency(debt.installment_value)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Juros:</span>
                          <div className="font-semibold text-orange-600">
                            {formatCurrency(debt.total_interest_amount)}
                          </div>
                        </div>
                      </div>

                      {debt.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-gray-500">Observações: </span>
                          {debt.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {debt.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimulate(debt)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Calculator className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(debt)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDebt(debt.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      );
  }
};

export default DebtManager;
