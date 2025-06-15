import { useMemo } from 'react';
import { getPatrimonyGroupByCategory, PatrimonyGroup } from "@/utils/patrimonyHelpers";

// Tipos mínimos esperados
type Asset = { id: string; name: string; category: string; current_value: number };
type Liability = { id: string; name: string; category: string; remaining_amount: number };
type Investment = { id: string; name: string; type: string; current_value: number; liquidity?: string; maturity_date?: string };
type BankAccount = { id: string; name: string; bank_name: string; balance: number };

interface UsePatrimonyGroupsFullArgs {
  assets: Asset[];
  liabilities: Liability[];
  investments: Investment[];
  bankAccounts: BankAccount[];
}

export function usePatrimonyGroupsFull({
  assets,
  liabilities,
  investments,
  bankAccounts,
}: UsePatrimonyGroupsFullArgs) {
  // Linked investments and bank accounts IDs
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

  // Agrupamento patrimonial centralizado
  const groups = useMemo(() => {
    const result: Record<PatrimonyGroup, any[]> = {
      ativo_circulante: [],
      ativo_nao_circulante: [],
      passivo_circulante: [],
      passivo_nao_circulante: [],
    };
    // assets
    assets.forEach(asset => {
      const group = getPatrimonyGroupByCategory(asset.category, asset, investments);
      if (group === "ativo_circulante" || group === "ativo_nao_circulante") {
        result[group].push(asset);
      }
    });
    // contas bancárias não linkadas
    nonLinkedBankAccounts.forEach(acc => {
      result.ativo_circulante.push({
        id: acc.id,
        name: acc.name + " (" + acc.bank_name + ")",
        category: "conta_corrente",
        current_value: acc.balance,
      });
    });
    // investimentos não linkados
    nonLinkedInvestments.forEach(inv => {
      // ** NOVA LOGICA DE CLASSIFICACAO AUTOMATICA **
      const group = getPatrimonyGroupByCategory(undefined, inv);
      if (group === "ativo_circulante" || group === "ativo_nao_circulante") {
        result[group].push({
          id: inv.id,
          name: inv.name,
          category: inv.type,
          current_value: inv.current_value,
          liquidity: inv.liquidity,
          maturity_date: inv.maturity_date,
        });
      }
    });
    // liabilities
    liabilities.forEach(liab => {
      const group = getPatrimonyGroupByCategory(liab.category);
      if (group === "passivo_circulante" || group === "passivo_nao_circulante") {
        result[group].push(liab);
      }
    });
    return result;
  }, [assets, liabilities, investments, nonLinkedBankAccounts, nonLinkedInvestments]);

  // Totais memoizados
  const totals = useMemo(() => ({
    ativo_circulante: groups.ativo_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    ativo_nao_circulante: groups.ativo_nao_circulante.reduce((sum, a) => sum + (a.current_value || 0), 0),
    passivo_circulante: groups.passivo_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
    passivo_nao_circulante: groups.passivo_nao_circulante.reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
  }), [groups]);

  return {
    groups,
    totals,
    linkedBankAccountIds,
    linkedInvestmentIds,
    nonLinkedBankAccounts,
    nonLinkedInvestments,
  };
}
