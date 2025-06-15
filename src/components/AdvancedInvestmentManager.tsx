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
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'stocks',
    amount: '',
    yield_type: 'fixed' as 'fixed' | 'cdi' | 'selic' | 'ipca',
    yield_rate: '',
    purchase_date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none',
    category: 'other', // valor default é 'other', não vazio!
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
    const categoryProcessed = (formData.category === "other" ? undefined : formData.category);

    const investmentData = {
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      yield_type: formData.yield_type,
      yield_rate: parseFloat(formData.yield_rate) || 0,
      purchase_date: formData.purchase_date,
      bank_account_id: formData.bank_account_id === 'none' ? undefined : formData.bank_account_id,
      category: categoryProcessed,
    };

    if (editingInvestment) {
      updateInvestment({ id: editingInvestment.id, ...investmentData });
      setEditingInvestment(null);
    } else {
      addInvestment(investmentData);
    }
    setNewInvestment({
      name: '',
      type: 'stocks',
      amount: '',
      yield_type: 'fixed',
      yield_rate: '',
      purchase_date: new Date().toISOString().split('T')[0],
      bank_account_id: 'none',
      category: 'other',
    });
    setIsAddingNew(false);
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setNewInvestment({
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString(),
      yield_type: investment.yield_type,
      yield_rate: investment.yield_rate.toString(),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Investido</p>
              <p className="text-lg font-semibold">{formatCurrency(totalInvested)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Atual</p>
              <p className="text-lg font-semibold">{formatCurrency(currentInvestmentValue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${investmentReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Percent className={`w-5 h-5 ${investmentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rendimento</p>
              <p className={`text-lg font-semibold ${investmentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(investmentReturn)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add New Investment */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gerenciar Investimentos</h3>
          <Button onClick={() => setIsAddingNew(!isAddingNew)}>
            <Plus className="w-4 h-4 mr-2" />
            {editingInvestment ? 'Cancelar Edição' : 'Novo Investimento'}
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
                name: '',
                type: 'stocks',
                amount: '',
                yield_type: 'fixed',
                yield_rate: '',
                purchase_date: new Date().toISOString().split('T')[0],
                bank_account_id: 'none',
                category: 'other',
              });
            }}
          />
        )}

        {/* Investment List */}
        <div className="space-y-4">
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum investimento encontrado</p>
              <p className="text-sm">Adicione seus primeiros investimentos!</p>
            </div>
          ) : (
            investments.map((investment, index) => {
              const returnValue = investment.current_value - investment.amount;
              const returnPercentage = ((investment.current_value - investment.amount) / investment.amount) * 100;
              
              return (
                <div key={investment.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getInvestmentTypeIcon(investment.type)}</span>
                        <div>
                          <h4 className="font-medium">{investment.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{investment.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Valor Atual</p>
                          <p className="font-semibold">{formatCurrency(investment.current_value)}</p>
                          <p className={`text-sm ${returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {returnValue >= 0 ? '+' : ''}{formatCurrency(returnValue)} ({formatPercentage(returnPercentage)})
                          </p>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(investment)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Investido</p>
                          <p className="font-medium">{formatCurrency(investment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rendimento</p>
                          <p className="font-medium">{investment.yield_type.toUpperCase()} {formatPercentage(investment.yield_rate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Data</p>
                          <p className="font-medium">{new Date(investment.purchase_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Yield Rates Panel Mantido */}
      <YieldRatesEvolutionPanel />
    </div>
  );
};

export default AdvancedInvestmentManager;
