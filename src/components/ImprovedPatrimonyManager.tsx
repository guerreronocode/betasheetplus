import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';

const assetCategoryOptions = [
  { value: 'conta_corrente', label: 'Conta corrente' },
  { value: 'dinheiro', label: 'Dinheiro em espécie' },
  { value: 'aplicacao_curto_prazo', label: 'Aplicação financeira (curto prazo)' },
  { value: 'carteira_digital', label: 'Carteira digital' },
  { value: 'poupanca', label: 'Poupança' },
  { value: 'emprestimo_a_receber_curto', label: 'Empréstimo a receber (curto prazo)' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'carro', label: 'Carro' },
  { value: 'moto', label: 'Moto' },
  { value: 'computador', label: 'Computador' },
  { value: 'investimento_longo_prazo', label: 'Investimento de longo prazo' },
  { value: 'outro_duravel', label: 'Outro bem durável' },
];

const liabilityCategoryOptions = [
  { value: 'cartao_credito', label: 'Cartão de crédito' },
  { value: 'parcelamento', label: 'Parcelamento' },
  { value: 'emprestimo_bancario_curto', label: 'Empréstimo bancário (curto prazo)' },
  { value: 'conta_pagar', label: 'Conta a pagar' },
  { value: 'financiamento_imovel', label: 'Financiamento de imóvel' },
  { value: 'financiamento_carro', label: 'Financiamento de carro (>12 meses)' },
  { value: 'emprestimo_pessoal_longo', label: 'Empréstimo pessoal (longo prazo)' },
];

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

const patrimonyGroupLabels: Record<PatrimonyGroup, string> = {
  ativo_circulante: 'Ativos Circulantes',
  ativo_nao_circulante: 'Ativos Não Circulantes',
  passivo_circulante: 'Passivos Circulantes',
  passivo_nao_circulante: 'Passivos Não Circulantes',
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

  // Submissão
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // logica de vínculo manual/investimento/conta
    if (entryType === 'asset') {
      // Entrada manual
      if (form.linkType === 'manual' || !form.linkType) {
        if (!form.name || !form.value || !form.category) return;
        const categoryRule = patrimonyCategoryRules[form.category];
        if (!categoryRule) return;

        const valueNum = parseFloat(form.value.replace(',', '.'));
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

      // Vínculo com investimento já registrado
      if (form.linkType === 'investment' && form.linkedInvestmentId) {
        const selectedInv = investments.find(inv => inv.id === form.linkedInvestmentId);
        if (!selectedInv) return;
        // A categoria será sempre "investimento_longo_prazo"
        addAsset({
          name: selectedInv.name,
          category: 'investimento_longo_prazo',
          current_value: selectedInv.current_value,
          purchase_date: selectedInv.purchase_date,
        });
      }

      // Vínculo com conta bancária já cadastrada
      if (form.linkType === 'bank' && form.linkedBankAccountId) {
        const account = bankAccounts.find(acc => acc.id === form.linkedBankAccountId);
        if (!account) return;
        // Categoria para conta corrente
        addAsset({
          name: account.name + ' (' + account.bank_name + ')',
          category: 'conta_corrente',
          current_value: account.balance,
          purchase_date: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      // Passivos (igual antes)
      if (!form.name || !form.value || !form.category) return;
      const categoryRule = patrimonyCategoryRules[form.category];
      if (!categoryRule) return;

      const valueNum = parseFloat(form.value.replace(',', '.'));
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

  // Classificação dos itens
  // Eliminar do resumo contas/investimentos que já estejam vinculados como ativos
  const linkedInvestmentIds = assets
    .filter(a => a.category === 'investimento_longo_prazo' && investments.find(inv => inv.name === a.name))
    .map(a => {
      const inv = investments.find(inv => inv.name === a.name);
      return inv ? inv.id : '';
    });
  const linkedBankAccountIds = assets
    .filter(a => a.category === 'conta_corrente' && bankAccounts.find(acc => a.name.includes(acc.name)))
    .map(a => {
      const acc = bankAccounts.find(acc => a.name.includes(acc.name));
      return acc ? acc.id : '';
    });

  // NOVA LÓGICA: Identificar investimentos de reserva de emergência como ativos circulantes
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
        investments.find(inv => inv.name === asset.name && inv.category === 'reserva_emergencia')
      ) {
        group = 'ativo_circulante';
      }
      if (group === 'ativo_circulante' || group === 'ativo_nao_circulante') {
        groups[group].push(asset);
      }
    });

    // Adicionar contas bancárias como ativos circulantes normalmente
    nonLinkedBankAccounts.forEach(acc => {
      groups.ativo_circulante.push({
        id: acc.id,
        name: acc.name + ' (' + acc.bank_name + ')',
        category: 'conta_corrente',
        current_value: acc.balance,
      });
    });

    nonLinkedInvestments.forEach(inv => {
      // Se for reserva de emergência, push em circulante
      if (inv.category === 'reserva_emergencia') {
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
    // ... keep liabilities grouping ...
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

  // Render
  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-3">Meu Patrimônio</h2>
      {/* Resumo Visual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {(['ativo_circulante', 'ativo_nao_circulante', 'passivo_circulante', 'passivo_nao_circulante'] as PatrimonyGroup[]).map((groupKey) => (
          <button
            key={groupKey}
            className={`rounded shadow p-3 w-full hover:bg-gray-100 text-sm flex flex-col items-center border 
              ${groupKey.includes('ativo') ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}
              ${selectedGroup === groupKey ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedGroup(selectedGroup === groupKey ? null : groupKey)}
          >
            <span className="font-semibold">{patrimonyGroupLabels[groupKey]}</span>
            <span className="text-lg font-bold">
              {formatCurrency(totals[groupKey])}
            </span>
            <span className="text-xs mt-1 text-gray-500">{groups[groupKey].length} itens</span>
          </button>
        ))}
      </div>
      {/* Patrimônio Líquido */}
      <div className="mb-6">
        <span className="text-blue-700 font-semibold">Patrimônio Líquido: </span>
        <span className="text-2xl font-bold">
          {formatCurrency(patrimonioLiquido)}
        </span>
      </div>
      {/* Itens do grupo selecionado */}
      {selectedGroup && (
        <div className="mb-6">
          <div className="font-semibold mb-1">{patrimonyGroupLabels[selectedGroup]}</div>
          <div className="space-y-2">
            {groups[selectedGroup].length === 0 && <span className="text-gray-400">Nenhum item cadastrado.</span>}
            {groups[selectedGroup].map(item => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-white border rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    Categoria: {(assetCategoryOptions.concat(liabilityCategoryOptions).find(opt => opt.value === item.category)?.label) || item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(item.current_value ?? item.remaining_amount ?? 0)}</span>
                  {item.current_value !== undefined && (
                    <Button size="icon" variant="outline" onClick={() => setForm({
                      name: item.name,
                      value: String(item.current_value ?? ''),
                      category: item.category,
                      id: item.id,
                      isEdit: true,
                      linkType: 'manual',
                      linkedInvestmentId: '',
                      linkedBankAccountId: '',
                    })}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {item.current_value !== undefined && (
                    <Button size="icon" variant="outline" onClick={() => deleteAsset(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  {item.remaining_amount !== undefined && (
                    <Button size="icon" variant="outline" onClick={() => deleteLiability(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Cadastro/Edição */}
      <div className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-2 border rounded p-4 mt-2 bg-gray-50">
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={entryType === 'asset' ? "default" : "outline"}
              onClick={() => setEntryType('asset')}
            >
              Ativo
            </Button>
            <Button
              type="button"
              variant={entryType === 'liability' ? "default" : "outline"}
              onClick={() => setEntryType('liability')}
            >
              Passivo
            </Button>
            {form.isEdit && (
              <Button
                type="button"
                variant="secondary"
                className="ml-2"
                onClick={() => { resetForm() }}
              >
                Cancelar edição
              </Button>
            )}
          </div>
          {entryType === 'asset' && (
            // ESCOLHA DO TIPO DE ENTRADA DO ATIVO
            <div>
              <Label>Tipo de vínculo</Label>
              <Select
                value={form.linkType}
                onValueChange={linkType =>
                  setForm(f => ({
                    ...f,
                    linkType,
                    // Resetar outros campos quando trocar o modo
                    linkedInvestmentId: '',
                    linkedBankAccountId: '',
                    name: '',
                    value: '',
                    category: '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Informar valor manualmente</SelectItem>
                  <SelectItem value="investment">Adicionar investimento já registrado</SelectItem>
                  <SelectItem value="bank">Adicionar conta bancária já cadastrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* FORMULÁRIO DINÂMICO */}
          {entryType === 'asset' && (form.linkType === 'manual' || form.linkType === '') && (
            <>
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={cat => setForm(f => ({ ...f, category: cat }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {entryType === 'asset' && form.linkType === 'investment' && (
            <div>
              <Label>Selecionar investimento</Label>
              <Select
                value={form.linkedInvestmentId}
                onValueChange={id => setForm(f => ({ ...f, linkedInvestmentId: id }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um investimento" />
                </SelectTrigger>
                <SelectContent>
                  {investments.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name} ({formatCurrency(inv.current_value)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {entryType === 'asset' && form.linkType === 'bank' && (
            <div>
              <Label>Selecionar conta bancária</Label>
              <Select
                value={form.linkedBankAccountId}
                onValueChange={id => setForm(f => ({ ...f, linkedBankAccountId: id }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} - {acc.bank_name} ({formatCurrency(acc.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Passivo: igual ao padrão */}
          {entryType === 'liability' && (
            <>
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={cat => setForm(f => ({ ...f, category: cat }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {liabilityCategoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={isAddingAsset || isAddingLiability}>
            {form.isEdit ? "Salvar alterações" : "Adicionar"}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ImprovedPatrimonyManager;
