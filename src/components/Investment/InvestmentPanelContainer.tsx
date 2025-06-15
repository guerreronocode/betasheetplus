import React, { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import InvestmentSummary from "./InvestmentSummary";
import YieldRatesEvolutionPanel from "@/components/YieldRatesEvolutionPanel";
import ManageInvestmentCard from "./ManageInvestmentCard";

const InvestmentPanelContainer = () => {
  const {
    investments,
    yieldRates,
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
    name: '',
    type: 'stocks',
    amount: '',
    yield_type: 'fixed',
    yield_rate: '',
    yield_extra: '',
    yield_percent_index: '',
    purchase_date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none',
    category: 'other',
  });

  // Formatações auxiliares (caso precise no futuro)
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Envio do formulário
  const handleInvestmentFormSubmit = (formData: any) => {
    if (!formData.name || !formData.amount) return;
    const safeAmount = parseFloat(formData.amount);
    if (isNaN(safeAmount) || safeAmount <= 0) return;

    // Monta apenas os campos permitidos
    const investmentData: any = {
      name: formData.name,
      type: formData.type,
      amount: safeAmount,
      yield_type: formData.yield_type,
      yield_rate: parseFloat(formData.yield_rate) || 0,
      purchase_date: formData.purchase_date,
      // current_value, last_yield_update e user_id são definidos no backend.
    };

    // Só inclui bank_account_id se for um valor válido
    if (
      formData.bank_account_id &&
      typeof formData.bank_account_id === "string" &&
      formData.bank_account_id !== "none" &&
      formData.bank_account_id !== ""
    ) {
      investmentData.bank_account_id = formData.bank_account_id;
    }

    // Remover o campo category porque NÃO existe na tabela investments.
    // Remover quaisquer outros campos que não existem!

    if (editingInvestment && (formData.id || editingInvestment.id)) {
      const _id = formData.id || editingInvestment.id;
      if (!_id) return;
      updateInvestment({ id: _id, ...investmentData });
      setEditingInvestment(null);
    } else {
      addInvestment(investmentData);
    }
    setNewInvestment({
      name: '',
      type: 'stocks',
      amount: '',
      yield_type: 'fixed',
      yield_rate: '',
      yield_extra: '',
      yield_percent_index: '',
      purchase_date: new Date().toISOString().split('T')[0],
      bank_account_id: 'none',
      category: 'other',
    });
    setIsAddingNew(false);
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setNewInvestment({
      name: investment.name,
      type: investment.type,
      amount: (investment.amount ?? '').toString(),
      yield_type: investment.yield_type,
      yield_rate: investment.yield_rate?.toString() ?? "",
      yield_extra: investment.yield_extra || "",
      yield_percent_index: investment.yield_percent_index || "",
      purchase_date: investment.purchase_date,
      bank_account_id: investment.bank_account_id || 'none',
      category: investment.category ? investment.category : 'other',
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (investmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      await deleteInvestment(investmentId);
      toast({ title: 'Investimento excluído com sucesso!' });
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
        yieldRates={yieldRates}
        investments={investments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <YieldRatesEvolutionPanel />
    </div>
  );
};
export default InvestmentPanelContainer;
