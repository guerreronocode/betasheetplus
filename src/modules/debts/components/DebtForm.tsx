
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebtFormData, DebtFormFactory, DebtCalculationService } from "@/services/debtService";
import { formatCurrency } from "@/utils/formatters";
import { liabilityCategoryOptions } from "@/components/patrimonyCategories";

interface DebtFormProps {
  initialData?: DebtFormData;
  onSubmit: (data: DebtFormData) => void;
  onCancel: () => void;
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

  const handleInputChange = (field: keyof DebtFormData, value: string) => {
    setError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  // Calcular métricas em tempo real para preview
  const metrics = DebtCalculationService.calculateDebtMetrics(formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="creditor">Credor *</Label>
          <Input
            id="creditor"
            value={formData.creditor}
            onChange={(e) => handleInputChange('creditor', e.target.value)}
            placeholder="Nome do credor"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {liabilityCategoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrição da dívida"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="financedAmount">Valor Financiado *</Label>
          <Input
            id="financedAmount"
            type="number"
            step="0.01"
            value={formData.financedAmount}
            onChange={(e) => handleInputChange('financedAmount', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="installmentValue">Valor da Parcela *</Label>
          <Input
            id="installmentValue"
            type="number"
            step="0.01"
            value={formData.installmentValue}
            onChange={(e) => handleInputChange('installmentValue', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="totalInstallments">Total de Parcelas *</Label>
          <Input
            id="totalInstallments"
            type="number"
            value={formData.totalInstallments}
            onChange={(e) => handleInputChange('totalInstallments', e.target.value)}
            placeholder="12"
            required
          />
        </div>

        <div>
          <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
          <Input
            id="paidInstallments"
            type="number"
            value={formData.paidInstallments}
            onChange={(e) => handleInputChange('paidInstallments', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: any) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="paid">Quitada</SelectItem>
              <SelectItem value="overdue">Em atraso</SelectItem>
              <SelectItem value="renegotiated">Renegociada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Data de Início *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Data de Vencimento *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Observações adicionais sobre a dívida"
          rows={3}
        />
      </div>

      {/* Preview das métricas */}
      {formData.financedAmount && formData.installmentValue && formData.totalInstallments && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Preview dos Cálculos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-blue-600">Total da Dívida:</span>
              <div className="font-semibold">{formatCurrency(metrics.totalDebtAmount)}</div>
            </div>
            <div>
              <span className="text-blue-600">Saldo Restante:</span>
              <div className="font-semibold">{formatCurrency(metrics.remainingBalance)}</div>
            </div>
            <div>
              <span className="text-blue-600">Total de Juros:</span>
              <div className="font-semibold">{formatCurrency(metrics.totalInterestAmount)}</div>
            </div>
            <div>
              <span className="text-blue-600">Taxa de Juros:</span>
              <div className="font-semibold">{metrics.totalInterestPercentage.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : (isEdit ? "Atualizar Dívida" : "Cadastrar Dívida")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default DebtForm;
