
import { patrimonyCategoryRules, getPatrimonyGroupByCategory, PatrimonyGroup } from "@/utils/patrimonyHelpers";

type Asset = { id: string; name: string; category?: string; current_value: number };
type Liability = { id: string; name: string; category?: string; remaining_amount: number };

export function usePatrimonyGroups(
  assets: Asset[],
  liabilities: Liability[],
  investments: any[] = [],
  bankAccounts: any[] = []
) {
  // Agrupa conforme regras de categoria patrimonial centralizada
  const groups: Record<PatrimonyGroup, any[]> = {
    ativo_circulante: [],
    ativo_nao_circulante: [],
    passivo_circulante: [],
    passivo_nao_circulante: [],
  };
  // Ativos
  assets.forEach(asset => {
    const group = getPatrimonyGroupByCategory(asset.category, asset, investments);
    if (group === "ativo_circulante" || group === "ativo_nao_circulante") {
      groups[group].push(asset);
    }
  });
  // Passivos
  liabilities.forEach(liab => {
    const group = getPatrimonyGroupByCategory(liab.category);
    if (group === "passivo_circulante" || group === "passivo_nao_circulante") {
      groups[group].push(liab);
    }
  });
  return groups;
}
