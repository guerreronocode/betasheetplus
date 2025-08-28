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

// Função para garantir que a data seja tratada sem timezone
export const formatDateForDatabase = (dateString: string): string => {
  // Se já está no formato correto, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Se é uma data do input HTML, mantém apenas a parte da data
  const date = new Date(dateString + 'T00:00:00.000');
  return date.toISOString().split('T')[0];
};

// Função para obter a data atual no formato correto para inputs
export const getTodayForInput = (): string => {
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
};
