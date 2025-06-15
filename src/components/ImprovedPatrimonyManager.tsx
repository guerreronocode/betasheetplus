import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import PatrimonyForm from "./PatrimonyForm";
import PatrimonyItemList from "./PatrimonyItemList";
import PatrimonySummary from "./PatrimonySummary";
import PatrimonyNetWorthCard from "./PatrimonyNetWorthCard";
import PatrimonyGroupSelector from "./PatrimonyGroupSelector";
import {
  assetCategoryOptions,
  liabilityCategoryOptions,
  patrimonyGroupLabels,
} from "./patrimonyCategories";

type PatrimonyGroup =
  | 'ativo_circulante'
  | 'ativo_nao_circulante'
  | 'passivo_circulante'
  | 'passivo_nao_circulante';

const patrimonyCategoryRules: Record<string, PatrimonyGroup> = {
  // Ativos Circulantes
  conta_corrente: 'ativo_circulante',
  dinheiro: 'ativo_circulante',
  aplicacao_curto_prazo: 'ativo_circulante',
  carteira_digital: 'ativo_circulante',
  poupanca: 'ativo_circulante',
  emprestimo_a_receber_curto: 'ativo_circulante',
  // Ativos Não Circulantes
  imovel: 'ativo_nao_circulante',
  carro: 'ativo_nao_circulante',
  moto: 'ativo_nao_circulante',
  computador: 'ativo_nao_circulante',
  investimento_longo_prazo: 'ativo_nao_circulante',
  outro_duravel: 'ativo_nao_circulante',
  // Passivos Circulantes
  cartao_credito: 'passivo_circulante',
  parcelamento: 'passivo_circulante',
  emprestimo_bancario_curto: 'passivo_circulante',
  conta_pagar: 'passivo_circulante',
  // Passivos Não Circulantes
  financiamento_imovel: 'passivo_nao_circulante',
  financiamento_carro: 'passivo_nao_circulante',
  emprestimo_pessoal_longo: 'passivo_nao_circulante',
  // Emergência:
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

  // NOVO: Obter contas bancárias e investimentos
  const { bankAccounts, investments } = useFinancialData();

  // Formulários Simplificados
  const [entryType, setEntryType] = useState<'asset' | 'liability'>('asset');
  const [form, setForm] = useState({
    name: '',
    value: '',
    category: '',
    id: '',
    isEdit: false,
    linkType: '', // 'manual' | 'investment' | 'bank'
    linkedInvestmentId: '',
    linkedBankAccountId: '',
  });

  const [selectedGroup, setSelectedGroup] = useState<PatrimonyGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // NOVOS HANDLERS para resetar link ao resetar formulário
  const resetForm = () =>
    setForm({
      name: '',
      value: '',
      category: '',
      id: '',
      isEdit: false,
      linkType: '',
      linkedInvestmentId: '',
      linkedBankAccountId: '',
    });

  // Handler para seleção de grupo (tipagem correta)
  const handleGroupSelect = (group: string | null) => {
    // Permite escolher e desmarcar o grupo
    if (selectedGroup === group) {
      setSelectedGroup(null);
    } else if (
      group === "ativo_circulante" ||
      group === "ativo_nao_circulante" ||
      group === "passivo_circulante" ||
      group === "passivo_nao_circulante"
    ) {
      setSelectedGroup(group);
    } else {
      setSelectedGroup(null);
    }
  };

  // Submissão
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Ativos
    if (entryType === 'asset') {
      if (form.linkType === 'manual' || !form.linkType) {
        if (!form.name || !form.value || !form.category) {
          setFormError("Preencha todos os campos obrigatórios.");
          return;
        }
        // Checagem de valor válido
        const valueNum = parseFloat(String(form.value).replace(',', '.'));
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
            purchase_date: new Date().toISOString().split('T')[0],
          });
        }
      }

      if (form.linkType === 'investment' && form.linkedInvestmentId) {
        const selectedInv = investments.find(inv => inv.id === form.linkedInvestmentId);
        if (!selectedInv) {
          setFormError("Selecione um investimento válido.");
          return;
        }
        addAsset({
          name: selectedInv.name,
          category: 'investimento_longo_prazo',
          current_value: selectedInv.current_value,
          purchase_date: selectedInv.purchase_date,
        });
      }

      if (form.linkType === 'bank' && form.linkedBankAccountId) {
        const account = bankAccounts.find(acc => acc.id === form.linkedBankAccountId);
        if (!account) {
          setFormError("Selecione uma conta bancária válida.");
          return;
        }
        addAsset({
          name: account.name + ' (' + account.bank_name + ')',
          category: 'conta_corrente',
          current_value: account.balance,
          purchase_date: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      // Passivos (igual antes)
      if (!form.name || !form.value || !form.category) {
        setFormError("Preencha todos os campos obrigatórios.");
        return;
      }
      const valueNum = parseFloat(String(form.value).replace(',', '.'));
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
        updateLiability({ id: form.id, name: form.name, category: form.category, remaining_amount: valueNum });
      } else {
        addLiability({
          name: form.name,
          category: form.category,
          total_amount: valueNum,
          remaining_amount: valueNum,
          interest_rate: 0, // <-- Fix: add required field with default value 0
        });
      }
    }

    resetForm();
  };

  // Identificação de vínculos
  const linkedInvestmentIds = assets
    .filter(a => a.category === 'investimento_longo_prazo' && investments.find(inv => inv.name === a.name))
    .map(a => {
      const inv = investments.find(inv => inv.name === a.name);
      return inv ? inv.id : '';
    });

  // Corrigido: definir corretamente contas bancárias não vinculadas
  const linkedBankAccountIds = assets
    .filter(a => a.category === 'conta_corrente' && bankAccounts.find(acc => a.name.includes(acc.name)))
    .map(a => {
      const acc = bankAccounts.find(acc => a.name.includes(acc.name));
      return acc ? acc.id : '';
    });

  // Definir contas bancárias não vinculadas!
  const nonLinkedBankAccounts = bankAccounts.filter(acc => !linkedBankAccountIds.includes(acc.id));

  // Investimentos que ainda não foram adicionados como ativos
  const nonLinkedInvestments = investments.filter(inv => !linkedInvestmentIds.includes(inv.id));

  // Agrupar conforme grupo patrimonial - REGRA ESPECIAL para reserva de emergência:
  const classifyAssetsLiabilities = () => {
    const groups: Record<PatrimonyGroup, any[]> = {
      ativo_circulante: [],
      ativo_nao_circulante: [],
      passivo_circulante: [],
      passivo_nao_circulante: [],
    };

    assets.forEach(asset => {
      let group = patrimonyCategoryRules[asset.category as string];
      // Se for um investimento com categoria reserva_emergencia, considerar sempre ativo circulante
      if (
        asset.category === 'investimento_longo_prazo' &&
        investments.find(inv => inv.name === asset.name && (inv as any).category === 'reserva_emergencia')
      ) {
        group = 'ativo_circulante';
      }
      if (group === 'ativo_circulante' || group === 'ativo_nao_circulante') {
        groups[group].push(asset);
      }
    });

    // Adicionar contas bancárias não vinculadas como ativos circulantes normalmente
    nonLinkedBankAccounts.forEach(acc => {
      groups.ativo_circulante.push({
        id: acc.id,
        name: acc.name + ' (' + acc.bank_name + ')',
        category: 'conta_corrente',
        current_value: acc.balance,
      });
    });

    // Adicionar investimentos não vinculados, respeitando categoria "reserva_emergencia"
    nonLinkedInvestments.forEach(inv => {
      const isEmergencyReserve = (inv as any).category === 'reserva_emergencia';
      if (isEmergencyReserve) {
        groups.ativo_circulante.push({
          id: inv.id,
          name: inv.name,
          category: 'reserva_emergencia',
          current_value: inv.current_value,
        });
      } else {
        groups.ativo_nao_circulante.push({
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
        groups[group].push(liab);
    });
    return groups;
  };

  const groups = classifyAssetsLiabilities();

  // Totais
  const totals = {
    ativo_circulante: groups.ativo_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    ativo_nao_circulante: groups.ativo_nao_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    passivo_circulante: groups.passivo_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
    passivo_nao_circulante: groups.passivo_nao_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
  };
  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        <div className="mb-6">
          <PatrimonyGroupSelector selectedGroup={selectedGroup} />
          <PatrimonyItemList
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
              const item = groups[selectedGroup].find((x: any) => x.id === id);
              if (item.current_value !== undefined) {
                deleteAsset(id);
              } else if (item.remaining_amount !== undefined) {
                deleteLiability(id);
              }
            }}
          />
        </div>
      )}
      <div className="max-w-xl">
        {formError && (
          <div className="text-red-600 text-sm mb-2">{formError}</div>
        )}
        <PatrimonyForm
          form={form}
          entryType={entryType}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancelEdit={resetForm}
          isSaving={isAddingAsset || isAddingLiability}
          investments={investments}
          bankAccounts={bankAccounts}
        />
      </div>
    </Card>
  );
};

export default ImprovedPatrimonyManager;
