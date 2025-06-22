interface FormatCurrencyOptions {
  compact?: boolean;
}

export const formatCurrency = (value: number, options?: FormatCurrencyOptions): string => {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'BRL'
  };

  if (options?.compact) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }

  return new Intl.NumberFormat('pt-BR', formatOptions).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};
