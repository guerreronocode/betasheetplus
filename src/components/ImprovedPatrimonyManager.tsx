
import React, { useState, useCallback, useEffect } from 'react';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import { patrimonyGroupLabels } from "./patrimonyCategories";
import { usePatrimonyGroupsFull } from "@/hooks/usePatrimonyGroupsFull";
import { PatrimonyFormFactory, PatrimonyFormData } from "@/services/patrimonyService";
import { patrimonyCategoryRules } from "@/utils/patrimonyHelpers";
import PatrimonyHeaderSection from "./PatrimonyHeaderSection";
import PatrimonyListSection from "./PatrimonyListSection";
import { AssetFormDialog } from './patrimony/AssetFormDialog';
import { LiabilityFormDialog } from './patrimony/LiabilityFormDialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

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
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLiabilityDialogOpen, setIsLiabilityDialogOpen] = useState(false);

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

  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  const handleGroupSelect = useCallback((group: string) => {
    setSelectedGroup(prev =>
      prev === group ? null :
      (["ativo_circulante", "ativo_nao_circulante", "passivo_circulante", "passivo_nao_circulante"].includes(group) ? group : null)
    );
  }, []);

  const handleEditItem = useCallback((item: any) => {
    // Não permitir edição de itens que vêm de dívidas automaticamente ou cartões de crédito
    if (item.isDebt || item.isCreditCard || item.source === 'credit_card_debt') {
      return;
    }
    
    const isAsset = item.current_value !== undefined;
    const entryType = isAsset ? 'asset' : 'liability';
    setEntryType(entryType);
    setForm(PatrimonyFormFactory.createEditForm(item, entryType));
    
    if (isAsset) {
      setIsAssetDialogOpen(true);
    } else {
      setIsLiabilityDialogOpen(true);
    }
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    const item = Object.values(groups).flat().find((x: any) => x.id === id);
    
    // Não permitir exclusão de itens que vêm de dívidas automaticamente ou cartões de crédito
    if (item && (item.isDebt || item.isCreditCard || item.source === 'credit_card_debt')) {
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
      <PatrimonyHeaderSection
        groups={groups}
        totals={totals}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
        netWorth={patrimonioLiquido}
      />

      {/* Action buttons */}
      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setEntryType('asset');
            setForm(PatrimonyFormFactory.createEmptyAssetForm());
            setIsAssetDialogOpen(true);
          }}
          title="Adicionar ativo"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setEntryType('liability');
            setForm(PatrimonyFormFactory.createEmptyLiabilityForm());
            setIsLiabilityDialogOpen(true);
          }}
          title="Adicionar passivo"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <AssetFormDialog
        open={isAssetDialogOpen}
        onOpenChange={setIsAssetDialogOpen}
        form={form}
        setForm={setForm}
        onResetForm={resetForm}
        patrimonyCategoryRules={patrimonyCategoryRules}
        investments={investments}
        bankAccounts={bankAccounts}
        debts={debts}
        isAddingAsset={isAddingAsset}
        addAsset={addAsset}
        updateAsset={updateAsset}
        deleteAsset={deleteAsset}
      />

      <LiabilityFormDialog
        open={isLiabilityDialogOpen}
        onOpenChange={setIsLiabilityDialogOpen}
        form={form}
        setForm={setForm}
        onResetForm={resetForm}
        patrimonyCategoryRules={patrimonyCategoryRules}
        investments={investments}
        bankAccounts={bankAccounts}
        debts={debts}
        isAddingLiability={isAddingLiability}
        addLiability={addLiability}
        updateLiability={updateLiability}
        deleteLiability={deleteLiability}
      />
    </div>
  );
};

export default ImprovedPatrimonyManager;
