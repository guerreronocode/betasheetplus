
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';

type SimpleYield = 'fixed' | 'cdi' | 'selic' | 'ipca';
type YieldType = SimpleYield | 'cdi_plus' | 'selic_plus' | 'ipca_plus';

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
  { value: 'Outros', label: 'Outros' },
  // adicione mais se precisar
];

const yieldTypes = [
  { value: 'fixed', label: 'Taxa Fixa' },
  { value: 'cdi', label: 'CDI' },
  { value: 'cdi_plus', label: 'CDI + X%' },
  { value: 'selic', label: 'SELIC' },
  { value: 'selic_plus', label: 'SELIC + X%' },
  { value: 'ipca', label: 'IPCA' },
  { value: 'ipca_plus', label: 'IPCA + X%' }
];

interface InvestmentCreateDialogProps {}

const InvestmentCreateDialog: React.FC<InvestmentCreateDialogProps> = () => {
  const { addInvestment, isAddingInvestment, yieldRates } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    type: string;
    amount: string;
    yield_type: YieldType;
    yield_rate: string;
    yield_extra: string;
    purchase_date: string;
  }>({
    name: '',
    type: '',
    amount: '',
    yield_type: 'fixed',
    yield_rate: '',
    yield_extra: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const handleYieldTypeChange = (type: YieldType) => {
    let extra = {};
    if (!type.endsWith("_plus")) {
      extra = { yield_extra: "" };
    }
    setForm(prev => ({
      ...prev,
      yield_type: type,
      ...extra
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.amount) return;

    let yield_rate_final: number = 0;

    if (form.yield_type === "cdi" || form.yield_type === "selic" || form.yield_type === "ipca") {
      const base = yieldRates.find(rate => rate.rate_type === form.yield_type)?.rate_value || 0;
      yield_rate_final = base;
    } else if (["cdi_plus", "selic_plus", "ipca_plus"].includes(form.yield_type)) {
      // Use base plus extra
      const baseType = form.yield_type.replace("_plus", "") as SimpleYield;
      const base = yieldRates.find(rate => rate.rate_type === baseType)?.rate_value || 0;
      const extra = parseFloat(form.yield_extra || "0");
      yield_rate_final = base + extra;
    } else if (form.yield_type === "fixed") {
      yield_rate_final = parseFloat(form.yield_rate || "0");
    }

    // O backend espera apenas o tipo simples!
    const submittedYieldType: SimpleYield =
      form.yield_type.endsWith('_plus')
        ? (form.yield_type.replace('_plus', '') as SimpleYield)
        : (form.yield_type as SimpleYield);

    addInvestment({
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      purchase_date: form.purchase_date,
      yield_type: submittedYieldType,
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

  return (
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
                {investmentTypes.map(type => (
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
                {yieldTypes.map(yt => (
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
  );
};

export default InvestmentCreateDialog;
