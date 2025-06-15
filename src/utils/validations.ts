
/**
 * Validações reutilizáveis para formulários
 */
export function isPositiveNumber(val: any): boolean {
  return typeof val === "number" && !isNaN(val) && val > 0;
}

export function isValidDateString(dateStr: string): boolean {
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime());
}
