
// Refatorado! Agora o formulário só pede o essencial do investimento!
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InvestmentTypeField from "./fields/InvestmentTypeField";
import InvestmentCategoryField from "./fields/InvestmentCategoryField";
import InvestmentAmountField from "./fields/InvestmentAmountField";
import InvestmentBankAccountField from "./fields/InvestmentBankAccountField";
import InvestmentDateField from "./fields/InvestmentDateField";

interface InvestmentFormProps {
  isAdding: boolean;
  isEditing: boolean;
  initialValues: any;
  bankAccounts: Array<{ id: string; name: string; bank_name: string; color?: string; }>;
  yieldRates: Array<{ rate_type: string; rate_value: number }>; // Não será mais usado
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
  onCancel,
}) => {
  const [form, setForm] = useState({
    ...initialValues,
    current_value: initialValues.current_value || initialValues.amount || "",
    reserva_emergencia: initialValues.category === "reserva_emergencia",
  });

  const handleChange = (partial: any) => setForm((prev: any) => ({ ...prev, ...partial }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let submitCategory = form.category;
    if (form.reserva_emergencia) {
      submitCategory = "reserva_emergencia";
    } else if (form.category === "reserva_emergencia") {
      submitCategory = "other";
    }

    const submitObj = {
      ...form,
      id: form.id, // pode ser undefined se for novo
      current_value: form.current_value,
      category: submitCategory,
    };
    onSubmit(submitObj);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
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
      {/* Tipo */}
      <InvestmentTypeField value={form.type} onChange={(value) => handleChange({ type: value })} />
      {/* Valor Inicial */}
      <InvestmentAmountField value={form.amount} onChange={(v) => handleChange({ amount: v })} />
      {/* Saldo Atual */}
      <div>
        <label className="block text-sm font-medium mb-1">Saldo Atual</label>
        <input
          className="w-full border rounded px-3 py-2"
          id="current_value"
          type="number"
          min="0"
          step="0.01"
          value={form.current_value}
          onChange={e => handleChange({ current_value: e.target.value })}
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Informe o valor mais recente do saldo desse investimento.
        </p>
      </div>
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
