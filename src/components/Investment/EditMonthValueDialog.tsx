import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { useInvestmentMonthlyValues } from '@/hooks/useInvestmentMonthlyValues';
import { useToast } from '@/hooks/use-toast';

interface EditMonthValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId: string;
  investmentName: string;
  month: Date;
  currentTotal: number;
  currentApplied: number;
  onSave: (investmentId: string, month: Date, newTotal: number) => void;
}

const EditMonthValueDialog: React.FC<EditMonthValueDialogProps> = ({
  open,
  onOpenChange,
  investmentId,
  investmentName,
  month,
  currentTotal,
  currentApplied,
  onSave,
}) => {
  const { toast } = useToast();
  const { upsertMonthlyValue } = useInvestmentMonthlyValues();
  const [newTotal, setNewTotal] = useState<string>(currentTotal.toString());

  const calculatedYield = parseFloat(newTotal || '0') - currentApplied;

  const handleSave = () => {
    const value = parseFloat(newTotal);
    
    if (isNaN(value) || value < 0) {
      toast({
        title: "Valor inválido",
        description: "O valor total deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    console.log('💾 Saving monthly value:', {
      investmentId,
      investmentName,
      month: month.toISOString(),
      totalValue: value,
      appliedValue: currentApplied,
      yieldValue: value - currentApplied
    });

    upsertMonthlyValue({
      investmentId,
      monthDate: month,
      totalValue: value,
      appliedValue: currentApplied
    });

    onSave(investmentId, month, value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Valor Total</DialogTitle>
          <DialogDescription>
            {investmentName} - {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor Aplicado (informativo)</Label>
            <Input 
              type="text" 
              value={formatCurrency(currentApplied)} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newTotal">Novo Valor Total</Label>
            <Input
              id="newTotal"
              type="number"
              step="0.01"
              min="0"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Atualize o valor total para refletir o rendimento acumulado
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-md space-y-1">
            <p className="text-xs font-medium">Rendimento calculado</p>
            <p className={`text-sm font-semibold ${calculatedYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculatedYield)}
            </p>
            <p className="text-xs text-muted-foreground">
              Diferença entre valor total e aplicado
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMonthValueDialog;
