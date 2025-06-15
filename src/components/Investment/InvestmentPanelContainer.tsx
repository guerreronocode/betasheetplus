
import React, { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import InvestmentSummary from "./InvestmentSummary";
import ManageInvestmentCard from "./ManageInvestmentCard";

const InvestmentPanelContainer = () => {
  const {
    investments,
    bankAccounts,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    isAddingInvestment,
    totalInvested,
    currentInvestmentValue,
    investmentReturn
  } = useFinancialData();

  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    type: "stocks",
    amount: "",
    purchase_date: new Date().toISOString().split("T")[0],
    bank_account_id: "none",
    category: "other",
    current_value: "",
  });

  // Formatação auxiliar
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // Envio do formulário
  const handleInvestmentFormSubmit = (formData: any) => {
    if (!formData.name || !formData.amount) return;
    const safeAmount = parseFloat(formData.amount);
    const safeCurrentValue =
      formData.current_value !== "" && formData.current_value !== undefined
        ? parseFloat(formData.current_value)
        : safeAmount;
    if (isNaN(safeAmount) || safeAmount <= 0) return;

    // Só os campos essenciais
    const investmentData: any = {
      name: formData.name,
      type: formData.type,
      amount: safeAmount,
      purchase_date: formData.purchase_date,
      current_value: safeCurrentValue,
      category: formData.category || "other",
    };

    if (
      formData.bank_account_id &&
      typeof formData.bank_account_id === "string" &&
      formData.bank_account_id !== "none" &&
      formData.bank_account_id !== ""
    ) {
      investmentData.bank_account_id = formData.bank_account_id;
    }

    if (editingInvestment && (formData.id || editingInvestment.id)) {
      const _id = formData.id || editingInvestment.id;
      if (!_id) return;
      updateInvestment({ id: _id, ...investmentData });
      setEditingInvestment(null);
    } else {
      addInvestment(investmentData);
    }
    setNewInvestment({
      name: "",
      type: "stocks",
      amount: "",
      purchase_date: new Date().toISOString().split("T")[0],
      bank_account_id: "none",
      category: "other",
      current_value: "",
    });
    setIsAddingNew(false);
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setNewInvestment({
      name: investment.name,
      type: investment.type,
      amount: (investment.amount ?? '').toString(),
      purchase_date: investment.purchase_date,
      bank_account_id: investment.bank_account_id || 'none',
      category: investment.category ? investment.category : 'other',
      current_value: investment.current_value?.toString() ?? investment.amount?.toString() ?? "",
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (investmentId: string) => {
    if (confirm("Tem certeza que deseja excluir este investimento?")) {
      await deleteInvestment(investmentId);
      toast({ title: "Investimento excluído com sucesso!" });
    }
  };

  return (
    <div className="space-y-6">
      <InvestmentSummary
        totalInvested={totalInvested}
        currentInvestmentValue={currentInvestmentValue}
        investmentReturn={investmentReturn}
      />
      <ManageInvestmentCard
        isAddingNew={isAddingNew}
        setIsAddingNew={setIsAddingNew}
        editingInvestment={editingInvestment}
        setEditingInvestment={setEditingInvestment}
        newInvestment={newInvestment}
        setNewInvestment={setNewInvestment}
        isAddingInvestment={isAddingInvestment}
        handleInvestmentFormSubmit={handleInvestmentFormSubmit}
        bankAccounts={bankAccounts}
        yieldRates={[]} // Mantém vazio apenas por compatibilidade com a tipagem do componente.
        investments={investments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default InvestmentPanelContainer;
