
/**
 * Utilitário para lidar com yield_types simples e compostos.
 */

/** Tipos permitidos simples (banco) */
export type SimpleYield = "fixed" | "cdi" | "selic" | "ipca";
/** Tipos que podem incluir o plus */
export type YieldType = SimpleYield | "cdi_plus" | "selic_plus" | "ipca_plus";

/**
 * Converte um YieldType (possivelmente _plus) para o tipo simples.
 */
export function toSimpleYieldType(type: YieldType): SimpleYield {
  if (type.endsWith("_plus")) {
    // "cdi_plus" -> "cdi" etc
    return type.replace("_plus", "") as SimpleYield;
  }
  return type as SimpleYield;
}
