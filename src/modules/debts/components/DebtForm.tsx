
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  DebtFormData, 
  DebtCalculationService, 
  DebtFormFactory 
} from "@/services/debtService";
import { formatCurrency } from "@/utils/formatters";

interface DebtFormProps {
  initialData?: DebtFormData;
  onSubmit: (formData: DebtFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const DebtForm: React.FC<DebtFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<DebtFormData>(
    initialData || DebtFormFactory.createEmptyForm()
  );
  const [error, setError] = useState<string | null>(null);

  // Calcular métricas em tempo real
  const metrics = DebtCalculationService.calculateDebtMetrics(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = DebtCalculationService.validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(formData);
  };

  const updateField = (field: keyof DebtFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-600 border-l-4 border-red-400 p-3 text-sm rounded">
          {error}
        </div>
      )}

      {/* Informações Básicas */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informações da Dívida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="creditor">Credor *</Label>
            <Input
              id="creditor"
              value={formData.creditor}
              onChange={(e) => updateField('creditor', e.target.value)}
              placeholder="Ex: Banco XYZ, Loja ABC"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="paid">Quitada</SelectItem>
                <SelectItem value="overdue">Em atraso</SelectItem>
                <SelectItem value="renegotiated">Renegociada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição da Dívida *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Ex: Financiamento do carro, Cartão de crédito"
              required
            />
          </div>
        </div>
      </Card>

      {/* Valores e Datas */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Valores e Prazos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="financedAmount">Valor Financiado (R$) *</Label>
            <Input
              id="financedAmount"
              type="number"
              step="0.01"
              value={formData.financedAmount}
              onChange={(e) => updateField('financedAmount', e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="installmentValue">Valor da Parcela (R$) *</Label>
            <Input
              id="installmentValue"
              type="number"
              step="0.01"
              value={formData.installmentValue}
              onChange={(e) => updateField('installmentValue', e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="startDate">Data de Início *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="totalInstallments">Número Total de Parcelas *</Label>
            <Input
              id="totalInstallments"
              type="number"
              min="1"
              value={formData.totalInstallments}
              onChange={(e) => updateField('totalInstallments', e.target.value)}
              placeholder="12"
              required
            />
          </div>

          <div>
            <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
            <Input
              id="paidInstallments"
              type="number"
              min="0"
              value={formData.paidInstallments}
              onChange={(e) => updateField('paidInstallments', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </Card>

      {/* Resumo Calculado */}
      <Card className="p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Resumo da Dívida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Valor Total da Dívida</Label>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(metrics.totalDebtAmount)}
            </p>
          </div>
          
          <div>
            <Label className="text-sm text-gray-600">Saldo Devedor</Label>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(metrics.remainingBalance)}
            </p>
          </div>

          <div>
            <Label className="text-sm text-gray-600">Juros Total (R$)</Label>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency(metrics.totalInterestAmount)}
            </p>
          </div>

          <div>
            <Label className="text-sm text-gray-600">Juros Total (%)</Label>
            <p className="text-lg font-semibold text-orange-600">
              {metrics.totalInterestPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Observações */}
      <Card className="p-4">
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Adicione observações sobre esta dívida..."
            rows={3}
          />
        </div>
      </Card>

      {/* Botões */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar Dívida' : 'Cadastrar Dívida')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default DebtForm;
