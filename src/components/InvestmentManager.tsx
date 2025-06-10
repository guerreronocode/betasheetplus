import React, { useState } from 'react';
import { TrendingUp, Plus, Building, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinancialData } from '@/hooks/useFinancialData';

const investmentTypes = [
  { value: 'stocks', label: 'Ações' },
  { value: 'bonds', label: 'Títulos' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'savings', label: 'Poupança' },
  { value: 'cdb', label: 'CDB' },
  { value: 'funds', label: 'Fundos' },
  { value: 'real_estate', label: 'Imóveis' },
  { value: 'other', label: 'Outros' }
];

const InvestmentManager = () => {
  const { investments, addInvestment, isAddingInvestment } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    type: '',
    amount: '',
    yield_type: 'fixed' as 'fixed' | 'cdi' | 'selic' | 'ipca',
    yield_rate: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.amount) return;
    
    addInvestment({
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      purchase_date: form.purchase_date,
      yield_type: form.yield_type,
      yield_rate: parseFloat(form.yield_rate) || 0
    });
    
    setForm({
      name: '',
      type: '',
      amount: '',
      yield_type: 'fixed',
      yield_rate: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    
    setIsDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateReturn = (initial: number, current: number) => {
    const percentage = ((current - initial) / initial) * 100;
    return {
      value: current - initial,
      percentage: percentage
    };
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
  const totalReturn = calculateReturn(totalInvested, totalCurrentValue);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Carteira de Investimentos</h3>
            <p className="text-sm text-gray-600">Gerencie seus investimentos</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Investimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Investimento</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: PETR4, Tesouro Direto, Bitcoin"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Valor Investido</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="yield_type">Tipo de Rendimento</Label>
                <Select
                  value={form.yield_type}
                  onValueChange={(value: 'fixed' | 'cdi' | 'selic' | 'ipca') => setForm(prev => ({ ...prev, yield_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de rendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Taxa Fixa</SelectItem>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="selic">SELIC</SelectItem>
                    <SelectItem value="ipca">IPCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="yield_rate">Taxa de Rendimento (%)</Label>
                <Input
                  id="yield_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.yield_rate}
                  onChange={(e) => setForm(prev => ({ ...prev, yield_rate: e.target.value }))}
                  placeholder="Ex: 12.5"
                />
              </div>
              
              <div>
                <Label htmlFor="purchase_date">Data da Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isAddingInvestment}>
                {isAddingInvestment ? 'Adicionando...' : 'Adicionar Investimento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Investido</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(totalInvested)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Valor Atual</span>
            </div>
            <p className="text-xl font-bold text-green-900">{formatCurrency(totalCurrentValue)}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${totalReturn.value >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${totalReturn.value >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${totalReturn.value >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                Retorno
              </span>
            </div>
            <p className={`text-xl font-bold ${totalReturn.value >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(totalReturn.value)} ({totalReturn.percentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="space-y-3">
        {investments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum investimento encontrado</p>
            <p className="text-sm">Adicione seu primeiro investimento!</p>
          </div>
        ) : (
          investments.map((investment, index) => {
            const returnData = calculateReturn(investment.amount, investment.current_value || investment.amount);
            const typeLabel = investmentTypes.find(t => t.value === investment.type)?.label || investment.type;
            
            return (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{investment.name}</p>
                    <p className="text-sm text-gray-600">{typeLabel}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(investment.current_value || investment.amount)}
                  </p>
                  <p className={`text-sm ${returnData.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnData.value >= 0 ? '+' : ''}{formatCurrency(returnData.value)} ({returnData.percentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default InvestmentManager;
