import { DebtData } from '@/services/debtService';

/**
 * Calcula a taxa de juros mensal efetiva usando o método de Newton-Raphson
 * para resolver a equação da tabela Price:
 * 
 * PV = PMT × [(1 - (1 + i)^-n) / i]
 * 
 * Onde:
 * - PV = Valor Presente (financed_amount)
 * - PMT = Parcela mensal (installment_value)
 * - n = Número de parcelas (total_installments)
 * - i = Taxa mensal (o que queremos descobrir)
 */
export function calculateEffectiveMonthlyRate(debt: DebtData): number {
  const { financed_amount, installment_value, total_installments } = debt;
  
  // Validações de segurança
  if (!financed_amount || financed_amount <= 0) return 0;
  if (!installment_value || installment_value <= 0) return 0;
  if (!total_installments || total_installments <= 0) return 0;
  
  // Caso especial: se parcela × qtd = valor financiado, taxa é zero
  if (Math.abs(installment_value * total_installments - financed_amount) < 0.01) {
    return 0;
  }
  
  // Estimativa inicial da taxa (baseada em aproximação)
  const totalPaid = installment_value * total_installments;
  const totalInterest = totalPaid - financed_amount;
  let rate = totalInterest / (financed_amount * total_installments);
  
  // Newton-Raphson para refinar a taxa
  const maxIterations = 100;
  const tolerance = 0.000001;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (rate <= -1) rate = 0.001; // Evitar valores negativos
    
    // Função: f(i) = PMT × [(1 - (1 + i)^-n) / i] - PV
    const onePlusRate = 1 + rate;
    const powTerm = Math.pow(onePlusRate, -total_installments);
    const numerator = 1 - powTerm;
    const denominator = rate;
    
    if (Math.abs(denominator) < tolerance) {
      rate = 0.001;
      continue;
    }
    
    const f = installment_value * (numerator / denominator) - financed_amount;
    
    // Derivada: f'(i)
    const term1 = -installment_value * numerator / (rate * rate);
    const term2 = installment_value * total_installments * powTerm / (onePlusRate * rate);
    const fPrime = term1 + term2;
    
    if (Math.abs(fPrime) < tolerance) break;
    
    const newRate = rate - f / fPrime;
    
    // Verificar convergência
    if (Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      break;
    }
    
    rate = newRate;
    
    // Limitar taxa a valores razoáveis (0% a 50% ao mês)
    rate = Math.max(0, Math.min(0.5, rate));
  }
  
  // Garantir taxa mínima realista para dívidas com juros
  if (totalInterest > 0 && rate < 0.001) {
    rate = 0.001; // 0.1% ao mês mínimo
  }
  
  return rate;
}

/**
 * Calcula a amortização mensal usando o sistema Price
 * 
 * @param remainingBalance Saldo devedor atual
 * @param installmentValue Valor da parcela fixa
 * @param monthlyRate Taxa de juros mensal (decimal)
 * @returns { interest, amortization, newBalance }
 */
export function calculatePriceAmortization(
  remainingBalance: number,
  installmentValue: number,
  monthlyRate: number
): {
  interest: number;
  amortization: number;
  newBalance: number;
} {
  if (remainingBalance <= 0) {
    return { interest: 0, amortization: 0, newBalance: 0 };
  }
  
  // Juros do mês = saldo × taxa
  const interest = remainingBalance * monthlyRate;
  
  // Amortização = parcela - juros
  let amortization = installmentValue - interest;
  
  // Se a amortização for maior que o saldo, ajustar
  if (amortization > remainingBalance) {
    amortization = remainingBalance;
  }
  
  // Novo saldo = saldo - amortização
  const newBalance = Math.max(0, remainingBalance - amortization);
  
  return {
    interest: Math.max(0, interest),
    amortization: Math.max(0, amortization),
    newBalance
  };
}

/**
 * Valida dados de dívida antes de processamento
 */
export function validateDebtData(debt: DebtData): boolean {
  if (!debt) return false;
  if (debt.remaining_balance <= 0) return false;
  if (debt.installment_value <= 0) return false;
  if (debt.total_installments <= 0) return false;
  if (debt.paid_installments < 0) return false;
  if (debt.paid_installments >= debt.total_installments) return false;
  
  return true;
}

/**
 * Calcula o valor presente de uma série de pagamentos
 */
export function calculatePresentValue(
  payment: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) return payment * periods;
  if (periods <= 0) return 0;
  
  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
}
