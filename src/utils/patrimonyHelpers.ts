
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
