import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import PatrimonyFormContainer from "./PatrimonyFormContainer";
import PatrimonyItemSection from "./PatrimonyItemSection";
import PatrimonySummary from "./PatrimonySummary";
import PatrimonyNetWorthCard from "./PatrimonyNetWorthCard";
import { patrimonyGroupLabels } from "./patrimonyCategories";
import { formatCurrency } from "@/utils/formatters";

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

type PatrimonyGroup =
  | 'ativo_circulante'
  | 'ativo_nao_circulante'
  | 'passivo_circulante'
  | 'passivo_nao_circulante';

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

  // Formulários Simplificados
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

  const [selectedGroup, setSelectedGroup] = useState(null);

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

  // Memoize expensive calculations
  const linkedInvestmentIds = useMemo(() => (
    assets
      .filter(a => a.category === 'investimento_longo_prazo' && investments.find(inv => inv.name === a.name))
      .map(a => {
        const inv = investments.find(inv => inv.name === a.name);
        return inv ? inv.id : '';
      })
  ), [assets, investments]);

  const linkedBankAccountIds = useMemo(() => (
    assets
      .filter(a => a.category === 'conta_corrente' && bankAccounts.find(acc => a.name.includes(acc.name)))
      .map(a => {
        const acc = bankAccounts.find(acc => a.name.includes(acc.name));
        return acc ? acc.id : '';
      })
  ), [assets, bankAccounts]);

  const nonLinkedBankAccounts = useMemo(() =>
    bankAccounts.filter(acc => !linkedBankAccountIds.includes(acc.id)),
    [bankAccounts, linkedBankAccountIds]
  );

  const nonLinkedInvestments = useMemo(() =>
    investments.filter(inv => !linkedInvestmentIds.includes(inv.id)),
    [investments, linkedInvestmentIds]
  );

  // Agrupar conforme grupo patrimonial (memoizado)
  const groups = useMemo(() => {
    const result = {
      ativo_circulante: [],
      ativo_nao_circulante: [],
      passivo_circulante: [],
      passivo_nao_circulante: [],
    };
    assets.forEach(asset => {
      let group = patrimonyCategoryRules[asset.category as string];
      if (
        asset.category === 'investimento_longo_prazo' &&
        investments.find(inv => inv.name === asset.name && (inv as any).category === 'reserva_emergencia')
      ) {
        group = 'ativo_circulante';
      }
      if (group === 'ativo_circulante' || group === 'ativo_nao_circulante') {
        result[group].push(asset);
      }
    });
    nonLinkedBankAccounts.forEach(acc => {
      result.ativo_circulante.push({
        id: acc.id,
        name: acc.name + ' (' + acc.bank_name + ')',
        category: 'conta_corrente',
        current_value: acc.balance,
      });
    });
    nonLinkedInvestments.forEach(inv => {
      const isEmergencyReserve = (inv as any).category === 'reserva_emergencia';
      if (isEmergencyReserve) {
        result.ativo_circulante.push({
          id: inv.id,
          name: inv.name,
          category: 'reserva_emergencia',
          current_value: inv.current_value,
        });
      } else {
        result.ativo_nao_circulante.push({
          id: inv.id,
          name: inv.name,
          category: 'investimento_longo_prazo',
          current_value: inv.current_value,
        });
      }
    });
    liabilities.forEach(liab => {
      const group = patrimonyCategoryRules[liab.category as string];
      if (group === 'passivo_circulante' || group === 'passivo_nao_circulante')
        result[group].push(liab);
    });
    return result;
  }, [assets, liabilities, investments, nonLinkedBankAccounts, nonLinkedInvestments]);

  // Totais patrimoniais memoizados
  const totals = useMemo(() => ({
    ativo_circulante: groups.ativo_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    ativo_nao_circulante: groups.ativo_nao_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    passivo_circulante: groups.passivo_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
    passivo_nao_circulante: groups.passivo_nao_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
  }), [groups]);

  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  // Memoize handler to avoid extra rerenders
  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(prev =>
      prev === group ? null :
      (["ativo_circulante", "ativo_nao_circulante", "passivo_circulante", "passivo_nao_circulante"].includes(group) ? group : null)
    );
  }, []);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-3">Meu Patrimônio</h2>
      <PatrimonySummary
        groups={groups}
        totals={totals}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
      />
      <PatrimonyNetWorthCard netWorth={patrimonioLiquido} />

      {selectedGroup && (
        <PatrimonyItemSection
          groupKey={selectedGroup}
          groupLabel={patrimonyGroupLabels[selectedGroup]}
          items={groups[selectedGroup]}
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
            const item = groups[selectedGroup].find((x) => x.id === id);
            if (item.current_value !== undefined) {
              deleteAsset(id);
            } else if (item.remaining_amount !== undefined) {
              deleteLiability(id);
            }
          }}
        />
      )}

      <PatrimonyFormContainer
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
    </Card>
  );
};

export default ImprovedPatrimonyManager;
