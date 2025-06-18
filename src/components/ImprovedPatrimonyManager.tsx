
import React, { useState, useCallback, useEffect } from 'react';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import { patrimonyGroupLabels } from "./patrimonyCategories";
import { usePatrimonyGroupsFull } from "@/hooks/usePatrimonyGroupsFull";
import { PatrimonyFormFactory, PatrimonyFormData } from "@/services/patrimonyService";
import { patrimonyCategoryRules } from "@/utils/patrimonyHelpers";
import PatrimonyHeaderSection from "./PatrimonyHeaderSection";
import PatrimonyListSection from "./PatrimonyListSection";
import PatrimonyManagerFormSection from "./PatrimonyManagerFormSection";

const ImprovedPatrimonyManager = () => {
  const {
    assets,
    liabilities,
    debts,
    addAsset,
    addLiability,
    updateAsset,
    updateLiability,
    deleteAsset,
    deleteLiability,
    syncCreditCardDebts,
    isAddingAsset,
    isAddingLiability,
    isSyncingCreditCardDebts,
    isLoading,
  } = usePatrimony();

  const { bankAccounts, investments } = useFinancialData();

  // Form state
  const [entryType, setEntryType] = useState<'asset' | 'liability'>('asset');
  const [form, setForm] = useState<PatrimonyFormData>(PatrimonyFormFactory.createEmptyAssetForm());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    if (entryType === 'asset') {
      setForm(PatrimonyFormFactory.createEmptyAssetForm());
    } else {
      setForm(PatrimonyFormFactory.createEmptyLiabilityForm());
    }
  }, [entryType]);

  const {
    groups,
    totals,
    nonLinkedBankAccounts,
    nonLinkedInvestments,
    nonLinkedDebts
  } = usePatrimonyGroupsFull({
    assets,
    liabilities,
    investments,
    bankAccounts,
    debts,
  });

  // Sincronizar dívidas de cartão de crédito na inicialização
  useEffect(() => {
    console.log('Sincronizando dívidas de cartão de crédito na inicialização do patrimônio...');
    syncCreditCardDebts();
  }, []);

  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  // Contar quantas dívidas de cartão de crédito temos
  const creditCardDebts = liabilities.filter(liability => liability.isCreditCard);

  const handleGroupSelect = useCallback((group: string) => {
    setSelectedGroup(prev =>
      prev === group ? null :
      (["ativo_circulante", "ativo_nao_circulante", "passivo_circulante", "passivo_nao_circulante"].includes(group) ? group : null)
    );
  }, []);

  const handleEditItem = useCallback((item: any) => {
    // Não permitir edição de itens que vêm de dívidas automaticamente ou cartões de crédito
    if (item.isDebt || item.isCreditCard) {
      return;
    }
    
    const isAsset = item.current_value !== undefined;
    const entryType = isAsset ? 'asset' : 'liability';
    setEntryType(entryType);
    setForm(PatrimonyFormFactory.createEditForm(item, entryType));
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    const item = Object.values(groups).flat().find((x: any) => x.id === id);
    
    // Não permitir exclusão de itens que vêm de dívidas automaticamente ou cartões de crédito
    if (item && (item.isDebt || item.isCreditCard)) {
      return;
    }
    
    if (item && item.current_value !== undefined) {
      deleteAsset(id);
    } else if (item && item.remaining_amount !== undefined) {
      deleteLiability(id);
    }
  }, [groups, deleteAsset, deleteLiability]);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Integração Automática</h3>
        <div className="space-y-1 text-sm text-blue-700">
          <p>
            As dívidas ativas registradas no sistema são automaticamente incluídas como passivos. 
            {nonLinkedDebts.length > 0 && ` ${nonLinkedDebts.length} dívida(s) foram automaticamente adicionadas.`}
          </p>
          {creditCardDebts.length > 0 && (
            <p>
              🏧 {creditCardDebts.length} dívida(s) de cartão de crédito sincronizada(s) automaticamente.
            </p>
          )}
          {isSyncingCreditCardDebts && (
            <p className="text-blue-600 font-medium">
              ⏳ Sincronizando dívidas de cartão de crédito...
            </p>
          )}
        </div>
      </div>

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
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
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
        debts={debts}
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
