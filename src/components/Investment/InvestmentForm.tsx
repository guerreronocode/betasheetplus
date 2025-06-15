
// Refatorado! InvestimentoForm agora usa subcomponentes para cada campo.
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InvestmentTypeField from "./fields/InvestmentTypeField";
import InvestmentCategoryField from "./fields/InvestmentCategoryField";
import InvestmentAmountField from "./fields/InvestmentAmountField";
import InvestmentYieldField from "./fields/InvestmentYieldField";
import InvestmentBankAccountField from "./fields/InvestmentBankAccountField";
import InvestmentDateField from "./fields/InvestmentDateField";

interface InvestmentFormProps {
  isAdding: boolean;
  isEditing: boolean;
  initialValues: any;
  bankAccounts: Array<{ id: string; name: string; bank_name: string; color?: string; }>;
  yieldRates: Array<{ rate_type: string; rate_value: number }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  isAdding,
  isEditing,
  initialValues,
  bankAccounts,
  yieldRates,
  onSubmit,
  onCancel
}) => {
  const [form, setForm] = useState({
    ...initialValues,
    reserva_emergencia: initialValues.category === "reserva_emergencia"
  });

  const handleChange = (partial: any) => setForm((prev: any) => ({ ...prev, ...partial }));

  const handleYieldTypeChange = (type: string) => {
    let extra = {};
    if (!type.endsWith("_plus")) extra = { yield_extra: "" };
    if (!(type === "cdi" || type === "selic" || type === "ipca")) {
      extra = { ...extra, yield_percent_index: "" };
    }
    handleChange({ yield_type: type, ...extra });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let yield_rate_final = form.yield_rate;
    if (["cdi", "selic", "ipca"].includes(form.yield_type)) {
      const base = yieldRates.find(rate => rate.rate_type === form.yield_type)?.rate_value || 0;
      const percent = parseFloat(form.yield_percent_index || "100") / 100;
      yield_rate_final = base * percent;
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

    let submitCategory = form.category;
    if (form.reserva_emergencia) {
      submitCategory = "reserva_emergencia";
    } else if (form.category === "reserva_emergencia") {
      submitCategory = "other";
    }
    onSubmit({
      ...form,
      yield_type: form.yield_type,
      yield_extra: form.yield_extra,
      yield_rate: yield_rate_final,
      category: submitCategory,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome do Investimento</label>
        <input
          className="w-full border rounded px-3 py-2"
          id="name"
          value={form.name}
          onChange={e => handleChange({ name: e.target.value })}
          required
        />
      </div>
      <InvestmentTypeField value={form.type} onChange={(value) => handleChange({ type: value })} />
      <InvestmentAmountField value={form.amount} onChange={(v) => handleChange({ amount: v })} />
      <InvestmentYieldField
        yield_type={form.yield_type}
        yield_rate={form.yield_rate}
        yield_extra={form.yield_extra}
        yield_percent_index={form.yield_percent_index}
        onYieldTypeChange={handleYieldTypeChange}
        onYieldRateChange={(v) => handleChange({ yield_rate: v })}
        onYieldExtraChange={(v) => handleChange({ yield_extra: v })}
        onYieldPercentIndexChange={(v) => handleChange({ yield_percent_index: v })}
      />
      <InvestmentDateField value={form.purchase_date} onChange={(date) => handleChange({ purchase_date: date })} />
      <InvestmentBankAccountField value={form.bank_account_id} accounts={bankAccounts} onChange={v => handleChange({ bank_account_id: v })} />
      <InvestmentCategoryField
        value={form.category}
        isEmergency={!!form.reserva_emergencia}
        onCategoryChange={v => handleChange({ category: v })}
        onEmergencyChange={(v) => handleChange({ reserva_emergencia: v })}
      />
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
