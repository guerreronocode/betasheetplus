
import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Percent, Plus, Edit2, Trash2, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import AssetPricesPanel from './AssetPricesPanel';
import YieldRatesEvolutionPanel from './YieldRatesEvolutionPanel';
import InvestmentForm from './Investment/InvestmentForm';
import InvestmentSummary from './Investment/InvestmentSummary';
import InvestmentList from './Investment/InvestmentList';

const AdvancedInvestmentManager = () => {
  const { 
    investments, 
    yieldRates, 
    bankAccounts,
    addInvestment, 
    updateInvestment,
    deleteInvestment,
    isAddingInvestment,
    totalInvested,
    currentInvestmentValue,
    investmentReturn
  } = useFinancialData();

  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [newInvestment, setNewInvestment] = useState<{
    name: string,
    type: string,
    amount: string,
    yield_type: 'fixed' | 'cdi' | 'selic' | 'ipca',
    yield_rate: string,
    yield_extra?: string,
    yield_percent_index?: string,
    purchase_date: string,
    bank_account_id: string,
    category: string
  }>({
    name: '',
    type: 'stocks',
    amount: '',
    yield_type: 'fixed',
    yield_rate: '',
    yield_extra: '',
    yield_percent_index: '',
    purchase_date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none',
    category: 'other',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Função tratadora para envio do formulário
  const handleInvestmentFormSubmit = (formData: any) => {
    if (!formData.name || !formData.amount) return;

    // Usar todos os campos processados vindos do formulário, sem sobrescrever
    const investmentData = {
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      yield_type: formData.yield_type,
      yield_rate: parseFloat(formData.yield_rate) || 0,
      yield_extra: formData.yield_extra || null,
      yield_percent_index: formData.yield_percent_index || null,
      purchase_date: formData.purchase_date,
      bank_account_id: formData.bank_account_id === 'none' ? undefined : formData.bank_account_id,
      category: formData.category,
    };

    // Se estiver editando, inclua o id!
    if (editingInvestment && formData.id) {
      // DEBUG: Certificando que o id está presente na atualização
      console.log('Updating investment (with id):', { id: formData.id, ...investmentData });
      updateInvestment({ id: formData.id, ...investmentData });
      setEditingInvestment(null);
    } else if (editingInvestment) {
      // fallback caso formData.id não esteja setado
      console.log('Updating investment (with fallback id):', { id: editingInvestment.id, ...investmentData });
      updateInvestment({ id: editingInvestment.id, ...investmentData });
      setEditingInvestment(null);
    } else {
      console.log('Adding new investment:', investmentData);
      addInvestment(investmentData);
    }
    setNewInvestment({
      name: '',
      type: 'stocks',
      amount: '',
      yield_type: 'fixed',
      yield_rate: '',
      yield_extra: '',
      yield_percent_index: '',
      purchase_date: new Date().toISOString().split("T")[0],
      bank_account_id: 'none',
      category: 'other',
    });
    setIsAddingNew(false);
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setNewInvestment({
      // todos os campos possíveis para edição:
      id: investment.id,
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString(),
      yield_type: investment.yield_type,
      yield_rate: investment.yield_rate?.toString() ?? "",
      yield_extra: investment.yield_extra || "",
      yield_percent_index: investment.yield_percent_index || "",
      purchase_date: investment.purchase_date,
      bank_account_id: investment.bank_account_id || 'none',
      category: investment.category ? investment.category : 'other',
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (investmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      await deleteInvestment(investmentId);
      toast({ title: 'Investimento excluído com sucesso!' });
    }
  };

  const getCurrentYieldRate = (yieldType: string) => {
    const rate = yieldRates.find(r => r.rate_type === yieldType);
    return rate ? rate.rate_value : 0;
  };

  const getInvestmentTypeIcon = (type: string) => {
    const icons = {
      stocks: '📈',
      crypto: '₿',
      bonds: '🏛️',
      'real-estate': '🏠',
      funds: '📊',
      savings: '🏦'
    };
    return icons[type as keyof typeof icons] || '💰';
  };

  return (
    <div className="space-y-6">
      {/* Investment Summary */}
      <InvestmentSummary
        totalInvested={totalInvested}
        currentInvestmentValue={currentInvestmentValue}
        investmentReturn={investmentReturn}
      />

      {/* Add New Investment */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gerenciar Investimentos</h3>
          <Button onClick={() => setIsAddingNew(!isAddingNew)}>
            <Plus className="w-4 h-4 mr-2" />
            {editingInvestment ? "Cancelar Edição" : "Novo Investimento"}
          </Button>
        </div>
        {isAddingNew && (
          <InvestmentForm
            isAdding={isAddingInvestment}
            isEditing={!!editingInvestment}
            initialValues={newInvestment}
            bankAccounts={bankAccounts}
            yieldRates={yieldRates}
            onSubmit={handleInvestmentFormSubmit}
            onCancel={() => {
              setIsAddingNew(false);
              setEditingInvestment(null);
              setNewInvestment({
                name: "",
                type: "stocks",
                amount: "",
                yield_type: "fixed",
                yield_rate: "",
                yield_extra: "",
                yield_percent_index: "",
                purchase_date: new Date().toISOString().split("T")[0],
                bank_account_id: "none",
                category: "other",
              });
            }}
          />
        )}
        {/* Investment List */}
        <InvestmentList
          investments={investments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Yield Rates Panel Mantido */}
      <YieldRatesEvolutionPanel />
    </div>
  );
};

export default AdvancedInvestmentManager;
