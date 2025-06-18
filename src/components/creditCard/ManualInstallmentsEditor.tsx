
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const generateDefaultInstallments = (): ManualInstallmentData[] => {
    const defaultAmount = totalAmount / installments;
    return Array.from({ length: installments }, (_, index) => ({
      installment_number: index + 1,
      amount: Number(defaultAmount.toFixed(2)),
    }));
  };

  React.useEffect(() => {
    if (isManualEnabled && manualInstallments.length === 0) {
      onManualInstallmentsChange(generateDefaultInstallments());
    }
  }, [isManualEnabled, installments, totalAmount]);

  const handleAmountChange = (index: number, amount: number) => {
    const updated = [...manualInstallments];
    updated[index] = { ...updated[index], amount };
    onManualInstallmentsChange(updated);
  };

  const calculateTotal = () => {
    return manualInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const currentTotal = calculateTotal();
  const difference = Math.abs(currentTotal - totalAmount);
  const isValid = difference < 0.01; // Tolerância para arredondamentos

  const handleToggle = (enabled: boolean) => {
    onToggleManual(enabled);
    if (enabled) {
      onManualInstallmentsChange(generateDefaultInstallments());
    } else {
      onManualInstallmentsChange([]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="manual-installments"
            checked={isManualEnabled}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor="manual-installments" className="text-sm font-medium">
            Definir valores das parcelas manualmente
          </Label>
        </div>
      </CardHeader>

      {isManualEnabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {manualInstallments.map((installment, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Label className="text-xs w-12 flex-shrink-0">
                  {installment.installment_number}ª:
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={installment.amount}
                  onChange={(e) => handleAmountChange(index, Number(e.target.value))}
                  className="text-sm"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total das parcelas:</span>
              <span className={!isValid ? 'text-red-600 font-medium' : 'text-green-600'}>
                R$ {currentTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Valor da compra:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
            {!isValid && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                ⚠️ A soma das parcelas deve ser igual ao valor total da compra.
                Diferença: R$ {difference.toFixed(2)}
              </div>
            )}
            {isValid && manualInstallments.length > 0 && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                ✅ Valores conferem! As parcelas somam o valor total da compra.
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onManualInstallmentsChange(generateDefaultInstallments())}
            className="w-full"
          >
            Resetar para valores iguais
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
