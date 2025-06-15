
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${(isNaN(value) ? 0 : value).toFixed(2)}%`;
};
