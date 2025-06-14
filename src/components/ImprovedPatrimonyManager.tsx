
import React, { useState, useCallback } from 'react';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import { patrimonyGroupLabels } from "./patrimonyCategories";
import { usePatrimonyGroupsFull } from "@/hooks/usePatrimonyGroupsFull";
import PatrimonyHeaderSection from "./PatrimonyHeaderSection";
import PatrimonyListSection from "./PatrimonyListSection";
import PatrimonyManagerFormSection from "./PatrimonyManagerFormSection";

// Centralizar regras só para passagem por props
const patrimonyCategoryRules: Record<string, string> = {
  conta_corrente: 'ativo_circulante',
  dinheiro: 'ativo_circulante',
  aplicacao_curto_prazo: 'ativo_circulante',
  carteira_digital: 'ativo_circulante',
  poupanca: 'ativo_circulante',
  emprestimo_a_receber_curto: 'ativo_circulante',
  imovel: 'ativo_nao_circulante',
  carro: 'ativo_nao_circulante',
  moto: 'ativo_nao_circulante',
  computador: 'ativo_nao_circulante',
  investimento_longo_prazo: 'ativo_nao_circulante',
  outro_duravel: 'ativo_nao_circulante',
  cartao_credito: 'passivo_circulante',
  parcelamento: 'passivo_circulante',
  emprestimo_bancario_curto: 'passivo_circulante',
  conta_pagar: 'passivo_circulante',
  financiamento_imovel: 'passivo_nao_circulante',
  financiamento_carro: 'passivo_nao_circulante',
  emprestimo_pessoal_longo: 'passivo_nao_circulante',
  reserva_emergencia: 'ativo_circulante',
};

const ImprovedPatrimonyManager = () => {
  const {
    assets,
    liabilities,
    addAsset,
    addLiability,
    updateAsset,
    updateLiability,
    deleteAsset,
    deleteLiability,
    isAddingAsset,
    isAddingLiability,
    isLoading,
  } = usePatrimony();

  const { bankAccounts, investments } = useFinancialData();

  // Form state
  const [entryType, setEntryType] = useState<'asset' | 'liability'>('asset');
  const [form, setForm] = useState({
    name: '',
    value: '',
    category: '',
    id: '',
    isEdit: false,
    linkType: '',
    linkedInvestmentId: '',
    linkedBankAccountId: '',
  });

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const resetForm = useCallback(() =>
    setForm({
      name: '',
      value: '',
      category: '',
      id: '',
      isEdit: false,
      linkType: '',
      linkedInvestmentId: '',
      linkedBankAccountId: '',
    }), []);

  const {
    groups,
    totals,
    nonLinkedBankAccounts,
    nonLinkedInvestments
  } = usePatrimonyGroupsFull({
    assets,
    liabilities,
    investments,
    bankAccounts,
  });

  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  const handleGroupSelect = useCallback((group: string) => {
    setSelectedGroup(prev =>
      prev === group ? null :
      (["ativo_circulante", "ativo_nao_circulante", "passivo_circulante", "passivo_nao_circulante"].includes(group) ? group : null)
    );
  }, []);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <PatrimonyHeaderSection
        groups={groups}
        totals={totals}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
        netWorth={patrimonioLiquido}
      />
      {selectedGroup && (
        <PatrimonyListSection
          selectedGroup={selectedGroup}
          groups={groups}
          onEdit={item => setForm({
            name: item.name,
            value: String(item.current_value ?? ""),
            category: item.category,
            id: item.id,
            isEdit: true,
            linkType: "manual",
            linkedInvestmentId: "",
            linkedBankAccountId: "",
          })}
          onDelete={id => {
            const item = groups[selectedGroup].find((x: any) => x.id === id);
            if (item && item.current_value !== undefined) {
              deleteAsset(id);
            } else if (item && item.remaining_amount !== undefined) {
              deleteLiability(id);
            }
          }}
        />
      )}

      <PatrimonyManagerFormSection
        entryType={entryType}
        setEntryType={setEntryType}
        onResetForm={resetForm}
        selectedGroup={selectedGroup}
        patrimonyCategoryRules={patrimonyCategoryRules}
        form={form}
        setForm={setForm}
        investments={investments}
        bankAccounts={bankAccounts}
        isAddingAsset={isAddingAsset}
        isAddingLiability={isAddingLiability}
        addAsset={addAsset}
        updateAsset={updateAsset}
        deleteAsset={deleteAsset}
        addLiability={addLiability}
        updateLiability={updateLiability}
        deleteLiability={deleteLiability}
      />
    </div>
  );
};

export default ImprovedPatrimonyManager;
