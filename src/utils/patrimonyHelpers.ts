/**
 * Helpers para regras de classificação e agrupamento patrimonial
 */
export type PatrimonyGroup =
  | "ativo_circulante"
  | "ativo_nao_circulante"
  | "passivo_circulante"
  | "passivo_nao_circulante";

export const patrimonyCategoryRules: Record<string, PatrimonyGroup> = {
  conta_corrente: "ativo_circulante",
  dinheiro: "ativo_circulante",
  aplicacao_curto_prazo: "ativo_circulante",
  carteira_digital: "ativo_circulante",
  poupanca: "ativo_circulante",
  emprestimo_a_receber_curto: "ativo_circulante",
  imovel: "ativo_nao_circulante",
  carro: "ativo_nao_circulante",
  moto: "ativo_nao_circulante",
  computador: "ativo_nao_circulante",
  investimento_longo_prazo: "ativo_nao_circulante",
  outro_duravel: "ativo_nao_circulante",
  cartao_credito: "passivo_circulante",
  parcelamento: "passivo_circulante",
  emprestimo_bancario_curto: "passivo_circulante",
  conta_pagar: "passivo_circulante",
  financiamento_imovel: "passivo_nao_circulante",
  financiamento_carro: "passivo_nao_circulante",
  emprestimo_pessoal_longo: "passivo_nao_circulante",
  reserva_emergencia: "ativo_circulante",
};

/**
 * Classificação automática: Decide o grupo do investimento pelas regras de liquidez e vencimento.
 */
export function classifyInvestmentGroup(
  investment: { liquidity?: string; maturity_date?: string; purchase_date?: string }
): PatrimonyGroup {
  const today = new Date();
  // Adiciona log para debug
  // Remapeia tipo para string padrão (pode chegar como undefined ou string vazia)
  const liquidity = investment.liquidity ?? '';
  const maturity_date = investment.maturity_date ?? '';
  if (liquidity === "diaria") return "ativo_circulante";
  if (liquidity === "vencimento" && maturity_date) {
    // Calcula diferença em meses
    const maturity = new Date(maturity_date);
    const diffMonths =
      (maturity.getFullYear() - today.getFullYear()) * 12 +
      (maturity.getMonth() - today.getMonth());
    if (diffMonths < 12 || (diffMonths === 12 && maturity.getDate() <= today.getDate())) {
      return "ativo_circulante";
    }
    return "ativo_nao_circulante";
  }
  // Default para não informado: longo prazo
  return "ativo_nao_circulante";
}

/**
 * Retorna o grupo patrimonial correto de acordo com a categoria e lógica especial.
 * - category: string ou undefined, obrigatório tratar
 * - item: asset/liability/investment
 */
export function getPatrimonyGroupByCategory(
  category: string | undefined,
  item?: any,
  investments?: any[]
): PatrimonyGroup | undefined {
  if ((!category || category === '') && item && (item.liquidity !== undefined)) {
    // Classificação automática para investimentos completamente sem categoria
    return classifyInvestmentGroup(item);
  }

  // Lógica especial: investimento_longo_prazo pode ser RESERVA DE EMERGÊNCIA
  if (
    category === "investimento_longo_prazo" &&
    item &&
    investments &&
    investments.some(inv => inv.name === item.name && inv.category === "reserva_emergencia")
  ) {
    return "ativo_circulante";
  }

  return patrimonyCategoryRules[category ?? ""];
}
