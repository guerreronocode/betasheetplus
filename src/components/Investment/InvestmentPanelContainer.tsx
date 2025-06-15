import React, { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import InvestmentSummary from "./InvestmentSummary";
import YieldRatesEvolutionPanel from "@/components/YieldRatesEvolutionPanel";
import ManageInvestmentCard from "./ManageInvestmentCard";

// Utilitário para calcular rendimento retroativo
function calculateRetroactiveValue({ 
  amount, 
  yield_type, 
  yield_rate, 
  yield_extra,
  yield_percent_index,
  purchase_date,
  yieldRates
}: {
  amount: number,
  yield_type: string,
  yield_rate: number,
  yield_extra?: string,
  yield_percent_index?: string,
  purchase_date: string,
  yieldRates: any[]
}) {
  // Normaliza yield_type para minúsculo
  const normalizedYieldType = yield_type?.toLowerCase() || "";

  // Para "stocks", retorna o próprio amount (patrimônio é atualizado externamente)
  if (
    normalizedYieldType === "stocks" ||
    normalizedYieldType === "funds" ||
    normalizedYieldType === "real_estate"
  ) return amount;

  // Busca a taxa base do índice (CDI, SELIC, IPCA) - usa yield_type removendo _plus se houver
  let rateKey = normalizedYieldType.endsWith("_plus")
    ? normalizedYieldType.replace("_plus", "")
    : normalizedYieldType;

  let indexRateObj = yieldRates.find((r) => r.rate_type.toLowerCase() === rateKey);
  let baseRate = indexRateObj?.rate_value ?? 0;

  // Console log para debug
  if (!indexRateObj) {
    console.log(
      `[Investment Calculation] Nenhuma taxa encontrada para o yield_type: ${rateKey}. yieldRates:`,
      yieldRates.map((r: any) => r.rate_type)
    );
  }

  // Percentual do índice (ex: 99% do CDI)
  let indexPercent = Number(yield_percent_index) || 100;
  let rate = baseRate * (indexPercent / 100);

  // Adicional caso _plus (CDI+X...)
  if (normalizedYieldType.endsWith("_plus")) {
    let plus = Number(yield_extra) || 0;
    rate += plus;
  }

  // Para taxa fixa: usa própria yield_rate (exibe field para user)
  if (normalizedYieldType === "fixed") {
    rate = Number(yield_rate) || 0;
  }

  // Dias desde a data de compra até hoje
  const purchase = new Date(purchase_date);
  const today = new Date();
  const days = Math.max(0, Math.floor((today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24)));

  // Compõe juros compostos (diário)
  if (rate > 0 && days > 0) {
    const dailyRate = rate / 100 / 365;
    const total = Number(amount) * Math.pow(1 + dailyRate, days);
    console.log(
      `[Investment Calculation] amount=${amount} | rate=${rate} | days=${days} | total=${total}`
    );
    return total;
  }
  return Number(amount);
}

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
      // Normaliza yield_type para minúsculo sempre
      yield_type: (formData.yield_type ?? "fixed").toLowerCase(),
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

    // Calcular current_value considerando rendimento retroativo se não for ação
    if (formData.purchase_date && formData.yield_type) {
      investmentData.current_value = calculateRetroactiveValue({
        amount: safeAmount,
        yield_type: (formData.yield_type ?? "fixed").toLowerCase(),
        yield_rate: formData.yield_rate,
        yield_extra: formData.yield_extra,
        yield_percent_index: formData.yield_percent_index,
        purchase_date: formData.purchase_date,
        yieldRates
      });
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
