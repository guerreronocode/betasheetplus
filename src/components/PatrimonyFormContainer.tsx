import React, { useState } from "react";
import PatrimonyForm from "./PatrimonyForm";
import { useFinancialData } from "@/hooks/useFinancialData";
import { usePatrimony } from "@/hooks/usePatrimony";

interface PatrimonyFormContainerProps {
  entryType: "asset" | "liability";
  setEntryType: (val: "asset" | "liability") => void;
  onResetForm: () => void;
  selectedGroup: string | null;
  patrimonyCategoryRules: Record<string, string>;
  form: any;
  setForm: (f: any) => void;
  investments: any[];
  bankAccounts: any[];
  isAddingAsset: boolean;
  isAddingLiability: boolean;
  addAsset: any;
  updateAsset: any;
  deleteAsset: any;
  addLiability: any;
  updateLiability: any;
  deleteLiability: any;
}

const PatrimonyFormContainer: React.FC<PatrimonyFormContainerProps> = ({
  entryType,
  setEntryType,
  onResetForm,
  selectedGroup,
  patrimonyCategoryRules,
  form,
  setForm,
  investments,
  bankAccounts,
  isAddingAsset,
  isAddingLiability,
  addAsset,
  updateAsset,
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability,
}) => {
  const [formError, setFormError] = useState<string | null>(null);

  // Handler para alternar tipo de entrada corretamente
  const handleTypeChange = (type: "asset" | "liability") => {
    setFormError(null);
    setEntryType(type);
    if (type === "liability") {
      // Limpa campos que só existem para ativo
      setForm({
        ...form,
        entryType: "liability",
        linkType: "",
        linkedInvestmentId: "",
        linkedBankAccountId: "",
        value: "",
        name: "",
        category: "",
        isEdit: false,
        id: "",
      });
    } else {
      // Limpa campos específicos de passivo
      setForm({
        ...form,
        entryType: "asset",
        linkType: "manual",
        linkedInvestmentId: "",
        linkedBankAccountId: "",
        value: "",
        name: "",
        category: "",
        isEdit: false,
        id: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (entryType === "liability") {
      // Lógica para formulário de passivo
      const { name, value, category, isEdit, id } = form;
      const valueNum = Number(String(value).replace(",", "."));

      if (!name || !value || !category) {
        setFormError("Preencha todos os campos obrigatórios.");
        return;
      }
      if (isNaN(valueNum) || valueNum < 0) {
        setFormError("Informe um valor positivo.");
        return;
      }
      const categoryRule = patrimonyCategoryRules[category];
      if (!categoryRule) {
        setFormError("Categoria inválida.");
        return;
      }

      // Se edição de passivo
      if (isEdit && id) {
        updateLiability({
          id,
          name,
          category,
          total_amount: valueNum,
          remaining_amount: valueNum,
        });
      } else {
        addLiability({
          name,
          category,
          total_amount: valueNum,
          remaining_amount: valueNum,
          interest_rate: 0,
        });
      }
      onResetForm();
      return;
    }

    // O fluxo de ativos permanece igual ao anterior
    if (entryType === "asset") {
      if (form.linkType === "manual" || !form.linkType) {
        if (!form.name || !form.value || !form.category) {
          setFormError("Preencha todos os campos obrigatórios.");
          return;
        }
        const valueNum = parseFloat(String(form.value).replace(",", "."));
        if (isNaN(valueNum) || valueNum < 0) {
          setFormError("Informe um valor positivo.");
          return;
        }
        const categoryRule = patrimonyCategoryRules[form.category];
        if (!categoryRule) {
          setFormError("Categoria inválida.");
          return;
        }
        if (form.isEdit && form.id) {
          updateAsset({ id: form.id, name: form.name, category: form.category, current_value: valueNum });
        } else {
          addAsset({
            name: form.name,
            category: form.category,
            current_value: valueNum,
            purchase_date: new Date().toISOString().split("T")[0],
          });
        }
      }
      if (form.linkType === "investment" && form.linkedInvestmentId) {
        const selectedInv = investments.find((inv) => inv.id === form.linkedInvestmentId);
        if (!selectedInv) {
          setFormError("Selecione um investimento válido.");
          return;
        }
        addAsset({
          name: selectedInv.name,
          category: "investimento_longo_prazo",
          current_value: selectedInv.current_value,
          purchase_date: selectedInv.purchase_date,
        });
      }
      if (form.linkType === "bank" && form.linkedBankAccountId) {
        const account = bankAccounts.find((acc) => acc.id === form.linkedBankAccountId);
        if (!account) {
          setFormError("Selecione uma conta bancária válida.");
          return;
        }
        addAsset({
          name: account.name + " (" + account.bank_name + ")",
          category: "conta_corrente",
          current_value: account.balance,
          purchase_date: new Date().toISOString().split("T")[0],
        });
      }
      onResetForm();
    }
  };

  return (
    <div className="max-w-xl">
      {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
      <PatrimonyForm
        form={form}
        entryType={entryType}
        onChange={(val) => {
          setFormError(null);
          setForm(val);
        }}
        onSubmit={handleSubmit}
        onCancelEdit={onResetForm}
        isSaving={isAddingAsset || isAddingLiability}
        investments={investments}
        bankAccounts={bankAccounts}
      />
    </div>
  );
};

export default PatrimonyFormContainer;
