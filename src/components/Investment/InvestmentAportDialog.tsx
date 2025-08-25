import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { useFinancialData } from '@/hooks/useFinancialData';

interface InvestmentAportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  onAport: (investmentId: string, amount: number, currentValue: number, bankAccountId: string) => void;
  isLoading?: boolean;
}

const InvestmentAportDialog: React.FC<InvestmentAportDialogProps> = ({
  isOpen,
  onClose,
  investment,
  onAport,
  isLoading = false
}) => {
  const { bankAccounts } = useFinancialData();
  const [amount, setAmount] = React.useState('');
  const [currentValue, setCurrentValue] = React.useState('');
  const [bankAccountId, setBankAccountId] = React.useState('');

  React.useEffect(() => {
    if (investment) {
      setCurrentValue(investment.current_value?.toString() || investment.amount?.toString() || '');
    }
  }, [investment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !currentValue) return;
    
    const aportAmount = parseFloat(amount);
    const newCurrentValue = parseFloat(currentValue);
    onAport(investment.id, aportAmount, newCurrentValue, bankAccountId);
    
    // Reset form
    setAmount('');
    setCurrentValue('');
    setBankAccountId('');
    onClose();
  };

  if (!investment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Realizar Aporte - {investment.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Valor atual registrado</p>
          <p className="font-semibold">{formatCurrency(investment.current_value || investment.amount)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor do Aporte</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <Label htmlFor="currentValue">Valor Atual do Investimento (após aporte)</Label>
            <Input
              id="currentValue"
              type="number"
              step="0.01"
              min="0"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0,00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe o valor total atual do investimento após o aporte
            </p>
          </div>
          <div>
            <Label htmlFor="bankAccount">Conta para Débito *</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bank_name} ({formatCurrency(account.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !amount || !currentValue || !bankAccountId}>
              {isLoading ? 'Processando...' : 'Realizar Aporte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentAportDialog;