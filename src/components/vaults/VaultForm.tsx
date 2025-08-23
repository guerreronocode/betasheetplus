import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import CurrencyInput from '@/components/shared/CurrencyInput';

interface VaultFormProps {
  bankAccountId: string;
  bankAccountBalance: number;
  totalReserved: number;
  onSubmit: (vault: any) => void;
  onCancel: () => void;
  isSaving?: boolean;
  initialData?: any;
}

const VaultForm: React.FC<VaultFormProps> = ({ 
  bankAccountId, 
  bankAccountBalance, 
  totalReserved,
  onSubmit, 
  onCancel, 
  isSaving = false,
  initialData 
}) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    reserved_amount: initialData?.reserved_amount?.toString() || '',
    description: initialData?.description || '',
    color: initialData?.color || '#10B981',
  });
  
  const [error, setError] = useState('');

  const availableAmount = bankAccountBalance - totalReserved + (initialData?.reserved_amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Nome do cofre é obrigatório');
      return;
    }

    const amount = form.reserved_amount ? parseFloat(form.reserved_amount) : 0;
    if (isNaN(amount) || amount < 0) {
      setError('Valor deve ser maior ou igual a zero');
      return;
    }

    if (amount > availableAmount) {
      setError(`Valor não pode exceder R$ ${availableAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      return;
    }

    const vaultData = {
      bank_account_id: bankAccountId,
      name: form.name.trim(),
      reserved_amount: amount,
      description: form.description.trim() || null,
      color: form.color,
    };

    if (initialData) {
      onSubmit({ id: initialData.id, ...vaultData });
    } else {
      onSubmit(vaultData);
    }
  };

  return (
    <Card className="p-4 mb-4 border-l-4" style={{ borderLeftColor: form.color }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">
            {initialData ? 'Editar Cofre' : 'Novo Cofre'}
          </h4>
          <div className="text-sm text-muted-foreground">
            Disponível: {availableAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Cofre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Viagem, Emergência..."
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor Reservado</Label>
            <CurrencyInput
              value={form.reserved_amount}
              onChange={(e) => setForm(prev => ({ ...prev, reserved_amount: e.target.value }))}
              placeholder="0,00"
              max={availableAmount}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Para que é esse cofre?"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            type="color"
            value={form.color}
            onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
            className="w-20 h-10"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Cofre'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default VaultForm;