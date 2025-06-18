export const formatCurrency = (
  value: number, 
  options: { compact?: boolean } = {}
) => {
  if (options.compact && value >= 1000000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${(isNaN(value) ? 0 : value).toFixed(2)}%`;
};
