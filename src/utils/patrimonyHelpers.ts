
/**
 * Helpers para regras de classificação e agrupamento patrimonial
 */
export type PatrimonyGroup =
  | "ativo_circulante"
  | "ativo_nao_circulante"
  | "passivo_circulante"
  | "passivo_nao_circulante";

// CORREÇÃO CRÍTICA: Mapeamento correto de categorias para grupos patrimoniais
export const patrimonyCategoryRules: Record<string, PatrimonyGroup> = {
  // Ativos Circulantes
  conta_corrente: "ativo_circulante",
  dinheiro: "ativo_circulante",
  aplicacao_curto_prazo: "ativo_circulante",
  carteira_digital: "ativo_circulante",
  poupanca: "ativo_circulante",
  emprestimo_a_receber_curto: "ativo_circulante",
  reserva_emergencia: "ativo_circulante",
  
  // Ativos Não Circulantes
  imovel: "ativo_nao_circulante",
  carro: "ativo_nao_circulante", // CRÍTICO: Garantir que carros são não circulantes
  moto: "ativo_nao_circulante",
  computador: "ativo_nao_circulante",
  investimento_longo_prazo: "ativo_nao_circulante",
  outro_duravel: "ativo_nao_circulante",
  
  // Passivos Circulantes
  cartao_credito: "passivo_circulante",
  parcelamento: "passivo_circulante",
  emprestimo_bancario_curto: "passivo_circulante",
  conta_pagar: "passivo_circulante",
  
  // Passivos Não Circulantes
  financiamento_imovel: "passivo_nao_circulante",
  financiamento_carro: "passivo_nao_circulante",
  emprestimo_pessoal_longo: "passivo_nao_circulante",
};

/**
 * Classificação automática: Decide o grupo do investimento pelas regras de liquidez e vencimento.
 */
export function classifyInvestmentGroup(
  investment: { liquidity?: string; maturity_date?: string; purchase_date?: string }
): PatrimonyGroup {
  const today = new Date();
  const liquidity = investment.liquidity ?? '';
  const maturity_date = investment.maturity_date ?? '';
  
  if (liquidity === "daily" || liquidity === "diaria") return "ativo_circulante";
  
  if (liquidity === "vencimento" && maturity_date) {
    const maturity = new Date(maturity_date);
    const diffMonths =
      (maturity.getFullYear() - today.getFullYear()) * 12 +
      (maturity.getMonth() - today.getMonth());
    if (diffMonths < 12 || (diffMonths === 12 && maturity.getDate() <= today.getDate())) {
      return "ativo_circulante";
    }
    return "ativo_nao_circulante";
  }
  
  return "ativo_nao_circulante";
}

/**
 * Retorna o grupo patrimonial correto de acordo com a categoria e lógica especial.
 */
export function getPatrimonyGroupByCategory(
  category: string | undefined,
  item?: any,
  investments?: any[]
): PatrimonyGroup | undefined {
  if ((!category || category === '') && item && (item.liquidity !== undefined)) {
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

/**
 * Função para classificar automaticamente um ativo baseado na sua categoria
 */
export function classifyAssetGroup(category: string): PatrimonyGroup {
  // Mapeamento direto das categorias para grupos
  const categoryToGroup = {
    'conta_corrente': 'ativo_circulante',
    'dinheiro': 'ativo_circulante',
    'aplicacao_curto_prazo': 'ativo_circulante',
    'carteira_digital': 'ativo_circulante',
    'poupanca': 'ativo_circulante',
    'emprestimo_a_receber_curto': 'ativo_circulante',
    'reserva_emergencia': 'ativo_circulante',
    'imovel': 'ativo_nao_circulante',
    'carro': 'ativo_nao_circulante', // CRÍTICO: Carros são sempre não circulantes
    'moto': 'ativo_nao_circulante',
    'computador': 'ativo_nao_circulante',
    'investimento_longo_prazo': 'ativo_nao_circulante',
    'outro_duravel': 'ativo_nao_circulante'
  } as const;

  return categoryToGroup[category as keyof typeof categoryToGroup] || 'ativo_nao_circulante';
}
