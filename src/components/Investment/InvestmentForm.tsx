// Refatorado! Agora o formulário só pede o essencial do investimento!
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InvestmentTypeField from "./fields/InvestmentTypeField";
import InvestmentAmountField from "./fields/InvestmentAmountField";
import InvestmentBankAccountField from "./fields/InvestmentBankAccountField";
import InvestmentDateField from "./fields/InvestmentDateField";
import InvestmentLiquidityField from "./fields/InvestmentLiquidityField";

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
    liquidity: initialValues.liquidity || "",
    maturity_date: initialValues.maturity_date || "",
  });

  const handleChange = (partial: any) => setForm((prev: any) => ({ ...prev, ...partial }));

  // Novo campo: liquidez e data de vencimento
  const handleLiquidityChange = (liquidity: string, maturity_date?: string) => {
    setForm(prev => ({
      ...prev,
      liquidity,
      maturity_date: liquidity === "vencimento" ? maturity_date || "" : "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitObj = {
      ...form,
      id: form.id,
      current_value: form.current_value,
      liquidity: form.liquidity,
      maturity_date: form.liquidity === "vencimento" ? form.maturity_date : null,
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
      {/* Liquidez */}
      <InvestmentLiquidityField
        value={form.liquidity}
        vencimento={form.maturity_date}
        onChange={handleLiquidityChange}
      />
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
