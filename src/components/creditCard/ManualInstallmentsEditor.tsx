
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { ManualInstallmentData } from '@/types/creditCard';

interface ManualInstallmentsEditorProps {
  totalAmount: number;
  installments: number;
  manualInstallments: ManualInstallmentData[];
  onManualInstallmentsChange: (installments: ManualInstallmentData[]) => void;
  onToggleManual: (enabled: boolean) => void;
  isManualEnabled: boolean;
}

export const ManualInstallmentsEditor: React.FC<ManualInstallmentsEditorProps> = ({
  totalAmount,
  installments,
  manualInstallments,
  onManualInstallmentsChange,
  onToggleManual,
  isManualEnabled,
}) => {
  const [localInstallments, setLocalInstallments] = useState<ManualInstallmentData[]>(
    manualInstallments.length > 0 ? manualInstallments : []
  );

  const generateDefaultInstallments = () => {
    const defaultValue = totalAmount / installments;
    const generated: ManualInstallmentData[] = [];
    
    for (let i = 1; i <= installments; i++) {
      generated.push({
        installment_number: i,
        amount: Number(defaultValue.toFixed(2))
      });
    }
    
    setLocalInstallments(generated);
    onManualInstallmentsChange(generated);
  };

  const updateInstallment = (index: number, amount: number) => {
    const updated = [...localInstallments];
    updated[index] = { ...updated[index], amount };
    setLocalInstallments(updated);
    onManualInstallmentsChange(updated);
  };

  const totalManual = localInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const difference = Math.abs(totalAmount - totalManual);
  const isValid = difference < 0.01;

  if (!isManualEnabled) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Parcelamento</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleManual(true);
              generateDefaultInstallments();
            }}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Editar Valores das Parcelas
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {installments}x de R$ {(totalAmount / installments).toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Valores das Parcelas</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleManual(false);
              setLocalInstallments([]);
              onManualInstallmentsChange([]);
            }}
          >
            Usar Parcelamento Automático
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {localInstallments.map((installment, index) => (
          <div key={index} className="flex items-center gap-2">
            <Label className="text-xs w-16">
              {installment.installment_number}ª:
            </Label>
            <Input
              type="number"
              step="0.01"
              value={installment.amount}
              onChange={(e) => updateInstallment(index, Number(e.target.value))}
              className="flex-1"
            />
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span>Total das parcelas:</span>
            <span className={isValid ? 'text-green-600' : 'text-red-600'}>
              R$ {totalManual.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Valor da compra:</span>
            <span>R$ {totalAmount.toFixed(2)}</span>
          </div>
          {!isValid && (
            <p className="text-xs text-red-600 mt-1">
              Diferença: R$ {difference.toFixed(2)}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateDefaultInstallments}
          className="w-full"
        >
          Redistribuir Igualmente
        </Button>
      </CardContent>
    </Card>
  );
};
