
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';

interface InvestmentFormProps {
  isAdding: boolean;
  isEditing: boolean;
  initialValues: any;
  bankAccounts: any[];
  yieldRates: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  isAdding,
  isEditing,
  initialValues,
  bankAccounts,
  yieldRates,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const getCurrentYieldRate = (yieldType: string) => {
    const rate = yieldRates.find(r => r.rate_type === yieldType);
    return rate ? rate.rate_value : 0;
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Investimento</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: PETR4, Tesouro Selic 2027"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(f => ({ ...f, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stocks">Ações</SelectItem>
              <SelectItem value="crypto">Criptomoedas</SelectItem>
              <SelectItem value="bonds">Títulos Públicos</SelectItem>
              <SelectItem value="real-estate">Fundos Imobiliários</SelectItem>
              <SelectItem value="funds">Fundos de Investimento</SelectItem>
              <SelectItem value="savings">Poupança</SelectItem>
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
            value={formData.amount}
            onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <Label htmlFor="bank_account">Conta Bancária</Label>
          <Select
            value={formData.bank_account_id}
            onValueChange={(value) => setFormData(f => ({ ...f, bank_account_id: value }))}
          >
            <SelectTrigger>
              <Building className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecione uma conta (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma conta específica</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: account.color }} />
                    <span>{account.name} - {account.bank_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="yield_type">Tipo de Rendimento</Label>
          <Select value={formData.yield_type} onValueChange={(value: any) => setFormData(f => ({ ...f, yield_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Taxa Pré-fixada</SelectItem>
              <SelectItem value="cdi">CDI ({formatPercentage(getCurrentYieldRate('cdi'))})</SelectItem>
              <SelectItem value="selic">SELIC ({formatPercentage(getCurrentYieldRate('selic'))})</SelectItem>
              <SelectItem value="ipca">IPCA ({formatPercentage(getCurrentYieldRate('ipca'))})</SelectItem>
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
            value={formData.yield_rate}
            onChange={e => setFormData(f => ({ ...f, yield_rate: e.target.value }))}
            placeholder={formData.yield_type === 'fixed' ? 'Ex: 12.50' : 'Automático'}
            disabled={formData.yield_type !== 'fixed'}
          />
        </div>
        <div>
          <Label htmlFor="purchase_date">Data de Compra</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={e => setFormData(f => ({ ...f, purchase_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="investment_category">Categoria do investimento</Label>
          <Select
            value={formData.category}
            onValueChange={cat => setFormData(f => ({ ...f, category: cat }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="other">Investimento (outros)</SelectItem>
              <SelectItem value="reserva_emergencia">Reserva de emergência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isAdding}>
          {isAdding ? 'Salvando...' : isEditing ? 'Atualizar Investimento' : 'Adicionar Investimento'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default InvestmentForm;
