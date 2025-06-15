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
    // OBS: nunca incluir id aqui
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
    console.log('handleInvestmentFormSubmit: formulário recebeu:', formData);
    if (!formData.name || !formData.amount) {
      console.log('Nome ou valor ausentes:', formData);
      return;
    }

    // amount deve sempre ser number!
    const safeAmount = parseFloat(formData.amount);
    if (isNaN(safeAmount) || safeAmount <= 0) {
      console.error('Valor inválido para amount:', formData.amount);
      return;
    }

    // Nunca envie id para add!
    const investmentData = {
      name: formData.name,
      type: formData.type,
      amount: safeAmount,
      yield_type: formData.yield_type,
      yield_rate: parseFloat(formData.yield_rate) || 0,
      yield_extra: formData.yield_extra || null,
      yield_percent_index: formData.yield_percent_index || null,
      purchase_date: formData.purchase_date,
      bank_account_id: formData.bank_account_id === 'none' ? undefined : formData.bank_account_id,
      category: formData.category,
    };

    if (editingInvestment && (formData.id || editingInvestment.id)) {
      // EDIT - garantir id correto
      const _id = formData.id || editingInvestment.id;
      if (!_id) {
        console.error('ID ausente para edição!', {formData, editingInvestment});
        return;
      }
      console.log('Atualizando investimento [id:', _id, '], dados:', investmentData);
      updateInvestment({ id: _id, ...investmentData });
      setEditingInvestment(null);
    } else {
      // ADD
      console.log('Adicionando novo investimento:', investmentData);
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
      purchase_date: new Date().toISOString().split('T')[0],
      bank_account_id: 'none',
      category: 'other',
    });
    setIsAddingNew(false);
  };

  const handleEdit = (investment: any) => {
    // Não colocar id no setNewInvestment!
    setEditingInvestment(investment);
    setNewInvestment({
      name: investment.name,
      type: investment.type,
      amount: (investment.amount ?? '').toString(),
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
          <Button onClick={() => {
            // Ao abrir para adicionar novo, limpa edição
            setIsAddingNew(!isAddingNew);
            if (isAddingNew) {
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
            }
          }}>
            <Plus className="w-4 h-4 mr-2" />
            {editingInvestment ? "Cancelar Edição" : "Novo Investimento"}
          </Button>
        </div>
        {isAddingNew && (
          <InvestmentForm
            isAdding={isAddingInvestment}
            isEditing={!!editingInvestment}
            // Passe id apenas nos initialValues se for edição!
            initialValues={
              editingInvestment 
                ? { ...newInvestment, id: editingInvestment.id } 
                : newInvestment
            }
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
