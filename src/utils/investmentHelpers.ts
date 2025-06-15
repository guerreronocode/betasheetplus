
/**
 * Funções utilitárias para cálculos e lógica de investimentos
 */
export function calculateReturn(initial: number, current: number) {
  const value = current - initial;
  const percentage = initial === 0 ? 0 : ((current - initial) / initial) * 100;
  return { value, percentage };
}

export function getInvestmentTypeLabel(type: string) {
  switch (type) {
    case "stocks": return "Ações";
    case "bonds": return "Títulos";
    case "crypto": return "Criptomoedas";
    case "savings": return "Poupança";
    case "cdb": return "CDB";
    case "funds": return "Fundos";
    case "real_estate": return "Imóveis";
    default: return "Outros";
  }
}

export function getInvestmentTypeIcon(type: string) {
  const icons: Record<string, string> = {
    stocks: "📈",
    crypto: "₿",
    bonds: "🏛️",
    "real-estate": "🏠",
    funds: "📊",
    savings: "🏦",
    cdb: "💳",
    real_estate: "🏠",
    other: "💰"
  };
  return icons[type] || "💰";
}
