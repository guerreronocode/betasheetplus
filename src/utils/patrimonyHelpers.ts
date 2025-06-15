
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
 * Retorna o grupo patrimonial correto de acordo com a categoria e lógica especial.
 * - category: string ou undefined, obrigatório tratar
 * - options: argumentos opcionais para lógica especial (ex: investimento)
 */
export function getPatrimonyGroupByCategory(
  category: string | undefined,
  item?: any, // asset/liability/investment
  investments?: any[]
): PatrimonyGroup | undefined {
  if (!category) return undefined;

  // Lógica especial: investimento_longo_prazo pode ser RESERVA DE EMERGÊNCIA
  if (
    category === "investimento_longo_prazo" &&
    item &&
    investments &&
    // busca no array de investimentos, category da instância == 'reserva_emergencia'
    investments.some(inv => inv.name === item.name && inv.category === "reserva_emergencia")
  ) {
    return "ativo_circulante";
  }

  return patrimonyCategoryRules[category];
}
