
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvestmentFormProps {
  isAdding: boolean;
  isEditing: boolean;
  initialValues: any;
  bankAccounts: Array<{ id: string; name: string; bank_name: string; color?: string; }>;
  yieldRates: Array<{ rate_type: string; rate_value: number }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const categories = [
  "Ações",
  "Títulos",
  "Criptomoedas",
  "Poupança",
  "CDB",
  "Fundos",
  "Imóveis",
  "ETFs",
  "Debêntures",
  "BDRs",
  "Tesouro Direto",
  "LCI",
  "LCA",
  "Previdência Privada",
  "COE",
  "FIIs",
  "Commodities",
  "Cashback",
  "Crowdfunding",
  "Offshore",
  "Outros"
];

const yieldTypes = [
  { value: "fixed", label: "Taxa Fixa" },
  { value: "cdi", label: "CDI" },
  { value: "cdi_plus", label: "CDI + X%" },
  { value: "selic", label: "SELIC" },
  { value: "selic_plus", label: "SELIC + X%" },
  { value: "ipca", label: "IPCA" },
  { value: "ipca_plus", label: "IPCA + X%" }
];

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  isAdding,
  isEditing,
  initialValues,
  bankAccounts,
  yieldRates,
  onSubmit,
  onCancel
}) => {
  const [form, setForm] = useState(initialValues);

  const handleChange = (partial: any) => {
    setForm((prev: any) => ({ ...prev, ...partial }));
  };

  const handleYieldTypeChange = (type: string) => {
    let extra = {};
    if (!type.endsWith("_plus")) {
      extra = { yield_extra: "" };
    }
    handleChange({ yield_type: type, ...extra });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Cálculo do yield_rate (salvar valor final conforme input)
    let yield_rate_final = form.yield_rate;

    if (form.yield_type === "cdi" || form.yield_type === "selic" || form.yield_type === "ipca") {
      const base = yieldRates.find(rate => rate.rate_type === form.yield_type)?.rate_value || 0;
      yield_rate_final = base;
    } else if (
      ["cdi_plus", "selic_plus", "ipca_plus"].includes(form.yield_type)
    ) {
      const baseType = form.yield_type.replace("_plus", "");
      const base = yieldRates.find(rate => rate.rate_type === baseType)?.rate_value || 0;
      const extra = parseFloat(form.yield_extra || "0");
      yield_rate_final = base + extra;
    } else if (form.yield_type === "fixed") {
      yield_rate_final = parseFloat(form.yield_rate || "0");
    }

    onSubmit({
      ...form,
      yield_type: form.yield_type,
      yield_extra: form.yield_extra,
      yield_rate: yield_rate_final,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Investimento</Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => handleChange({ name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={form.type}
          onValueChange={value => handleChange({ type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
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
          value={form.amount}
          onChange={e => handleChange({ amount: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="yield_type">Tipo de Rendimento</Label>
        <Select
          value={form.yield_type}
          onValueChange={handleYieldTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de rendimento" />
          </SelectTrigger>
          <SelectContent>
            {yieldTypes.map(yt => (
              <SelectItem key={yt.value} value={yt.value}>{yt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Exibir campo para "X%" apenas para *_plus */}
        {form.yield_type && form.yield_type.endsWith("_plus") && (
          <div className="mt-2">
            <Label htmlFor="yield_extra">Adicional (%)</Label>
            <Input
              id="yield_extra"
              type="number"
              step="0.01"
              min="0"
              value={form.yield_extra || ""}
              placeholder="0.00"
              onChange={e => handleChange({ yield_extra: e.target.value })}
              required
            />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="purchase_date">Data da Compra</Label>
        <Input
          id="purchase_date"
          type="date"
          value={form.purchase_date}
          onChange={e => handleChange({ purchase_date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="bank_account_id">Conta Bancária</Label>
        <Select
          value={form.bank_account_id}
          onValueChange={value => handleChange({ bank_account_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma conta (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma conta específica</SelectItem>
            {bankAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                  {acc.name} - {acc.bank_name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" className="w-full" disabled={isAdding}>
          {isAdding
            ? isEditing
              ? "Salvando..."
              : "Adicionando..."
            : isEditing
            ? "Salvar Alterações"
            : "Adicionar Investimento"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default InvestmentForm;
