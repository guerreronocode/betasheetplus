import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  onUpdate: (investmentId: string, currentValue: number) => void;
  isLoading?: boolean;
}

const InvestmentUpdateDialog: React.FC<InvestmentUpdateDialogProps> = ({
  isOpen,
  onClose,
  investment,
  onUpdate,
  isLoading = false
}) => {
  const [currentValue, setCurrentValue] = React.useState('');

  React.useEffect(() => {
    if (investment) {
      setCurrentValue(investment.current_value?.toString() || investment.amount?.toString() || '');
    }
  }, [investment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValue) return;
    
    const newCurrentValue = parseFloat(currentValue);
    onUpdate(investment.id, newCurrentValue);
    onClose();
  };

  if (!investment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Valor - {investment.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Valor Investido</p>
              <p className="font-semibold">{formatCurrency(investment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Valor Atual</p>
              <p className="font-semibold">{formatCurrency(investment.current_value || investment.amount)}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentValue">Novo Valor Atual</Label>
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
              Informe o valor atual do investimento conforme sua carteira
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !currentValue}>
              {isLoading ? 'Atualizando...' : 'Atualizar Valor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentUpdateDialog;