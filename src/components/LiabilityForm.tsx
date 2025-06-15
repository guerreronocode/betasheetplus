
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const liabilityCategories = {
  circulante: [
    'Cartão de crédito',
    'Empréstimos pessoais',
    'Cheque especial',
    'Financiamentos até 1 ano',
    'Outros passivos circulantes'
  ],
  nao_circulante: [
    'Financiamento imobiliário',
    'Financiamento de veículo',
    'Empréstimos de longo prazo',
    'Outros passivos não circulantes'
  ]
};

const LiabilityForm = ({
  onSubmit,
  onCancel,
  isLoading,
  editingLiability,
  newLiability,
  setNewLiability,
}: any) => (
  <form onSubmit={onSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="liability-name">Nome do Passivo</Label>
        <Input
          id="liability-name"
          value={newLiability.name}
          onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
          placeholder="Ex: Financiamento Casa"
          required
        />
      </div>
      <div>
        <Label htmlFor="liability-category">Categoria</Label>
        <Select value={newLiability.category} onValueChange={(value) => setNewLiability({ ...newLiability, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <optgroup label="Passivo Circulante">
              {liabilityCategories.circulante.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </optgroup>
            <optgroup label="Passivo Não Circulante">
              {liabilityCategories.nao_circulante.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </optgroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="liability-total">Valor Total</Label>
        <Input
          id="liability-total"
          type="number"
          step="0.01"
          min="0"
          value={newLiability.total_amount}
          onChange={(e) => setNewLiability({ ...newLiability, total_amount: e.target.value })}
          placeholder="0,00"
          required
        />
      </div>
      <div>
        <Label htmlFor="liability-remaining">Valor Restante</Label>
        <Input
          id="liability-remaining"
          type="number"
          step="0.01"
          min="0"
          value={newLiability.remaining_amount}
          onChange={(e) => setNewLiability({ ...newLiability, remaining_amount: e.target.value })}
          placeholder="0,00"
          required
        />
      </div>
      <div>
        <Label htmlFor="liability-rate">Taxa de Juros (%)</Label>
        <Input
          id="liability-rate"
          type="number"
          step="0.01"
          min="0"
          value={newLiability.interest_rate}
          onChange={(e) => setNewLiability({ ...newLiability, interest_rate: e.target.value })}
          placeholder="0,00"
        />
      </div>
      <div>
        <Label htmlFor="liability-payment">Pagamento Mensal (Opcional)</Label>
        <Input
          id="liability-payment"
          type="number"
          step="0.01"
          min="0"
          value={newLiability.monthly_payment}
          onChange={(e) => setNewLiability({ ...newLiability, monthly_payment: e.target.value })}
          placeholder="0,00"
        />
      </div>
    </div>
    <div className="flex space-x-2">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : editingLiability ? 'Atualizar' : 'Adicionar Passivo'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  </form>
);

export default LiabilityForm;
