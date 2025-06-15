
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
  { value: 'Ações', label: 'Ações' },
  { value: 'Títulos', label: 'Títulos' },
  { value: 'Criptomoedas', label: 'Criptomoedas' },
  { value: 'Poupança', label: 'Poupança' },
  { value: 'CDB', label: 'CDB' },
  { value: 'Fundos', label: 'Fundos' },
  { value: 'Imóveis', label: 'Imóveis' },
  { value: 'ETFs', label: 'ETFs' },
  { value: 'Debêntures', label: 'Debêntures' },
  { value: 'BDRs', label: 'BDRs' },
  { value: 'Tesouro Direto', label: 'Tesouro Direto' },
  { value: 'LCI', label: 'LCI' },
  { value: 'LCA', label: 'LCA' },
  { value: 'Previdência Privada', label: 'Previdência Privada' },
  { value: 'COE', label: 'COE' },
  { value: 'FIIs', label: 'FIIs' },
  { value: 'Commodities', label: 'Commodities' },
  { value: 'Cashback', label: 'Cashback' },
  { value: 'Crowdfunding', label: 'Crowdfunding' },
  { value: 'Offshore', label: 'Offshore' },
  { value: 'Outros', label: 'Outros' }
];

const yieldTypes = [
  { value: "fixed", label: "Taxa Fixa" },
  { value: "cdi", label: "CDI" },
  { value: "cdi_plus", label: "CDI + X%" },
  { value: "selic", label: "SELIC" },
  { value: "selic_plus", label: "SELIC + X%" },
  { value: "ipca", label: "IPCA" },
  { value: "ipca_plus", label: "IPCA + X%" }
];

const InvestmentManager = () => {
  const { investments, addInvestment, isAddingInvestment, yieldRates } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    type: '',
    amount: '',
    yield_type: 'fixed' as string,
    yield_rate: '',
    yield_extra: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const handleYieldTypeChange = (type: string) => {
    let extra = {};
    if (!type.endsWith("_plus")) {
      extra = { yield_extra: "" };
    }
    setForm(prev => ({ ...prev, yield_type: type, ...extra }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.amount) return;

    let yield_rate_final = form.yield_rate;

    if (form.yield_type === "cdi" || form.yield_type === "selic" || form.yield_type === "ipca") {
      const base = yieldRates.find(rate => rate.rate_type === form.yield_type)?.rate_value || 0;
      yield_rate_final = base;
    } else if (
      ["cdi_plus", "selic_plus", "ipca_plus"].includes(form.yield_type)
    ) {
      const baseType = form.yield_type.replace("_plus", "");
      const base = yieldRates.find(rate => rate.rate_type === baseType)?.rate_value || 0;
      const extra = parseFloat(form.yield_extra || "0");
      yield_rate_final = base + extra;
    } else if (form.yield_type === "fixed") {
      yield_rate_final = parseFloat(form.yield_rate || "0");
    }

    addInvestment({
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      purchase_date: form.purchase_date,
      yield_type: form.yield_type,
      yield_rate: yield_rate_final
    });
    
    setForm({
      name: '',
      type: '',
      amount: '',
      yield_type: 'fixed',
      yield_rate: '',
      yield_extra: '',
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
                  onValueChange={handleYieldTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de rendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {yieldTypes.map((yt) => (
                      <SelectItem key={yt.value} value={yt.value}>{yt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.yield_type && form.yield_type.endsWith("_plus") && (
                  <div className="mt-2">
                    <Label htmlFor="yield_extra">Adicional (%)</Label>
                    <Input
                      id="yield_extra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.yield_extra || ""}
                      placeholder="0.00"
                      onChange={e => setForm(prev => ({ ...prev, yield_extra: e.target.value }))}
                      required
                    />
                  </div>
                )}
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
                  placeholder="Ex: 12.5 (apenas para taxa fixa)"
                  required={form.yield_type === "fixed"}
                  disabled={form.yield_type !== "fixed"}
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
            const typeLabel = investment.type;
            
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
