
import { DebtData } from './debtService';

export interface EarlyPayoffCalculation {
  currentPayoffAmount: number;
  totalFuturePayments: number;
  interestSavings: number;
  remainingInstallments: number;
  monthlyInterestRate: number;
  annualInterestRate: number;
  recommendationScore: number;
  isRecommended: boolean;
  totalDebtWithInterest: number;
  totalDebtWithoutInterest: number;
}

export class EarlyPayoffCalculatorService {
  static calculateEarlyPayoff(debt: DebtData): EarlyPayoffCalculation {
    const remainingInstallments = debt.total_installments - debt.paid_installments;
    
    if (remainingInstallments <= 0) {
      return this.createEmptyCalculation();
    }

    // Calcular taxa de juros mensal implícita
    const monthlyRate = this.calculateImpliedMonthlyRate(debt);
    const annualRate = ((1 + monthlyRate) ** 12 - 1) * 100;
    
    // Valor presente das parcelas restantes (valor para quitar hoje)
    const currentPayoffAmount = this.calculatePresentValue(
      debt.installment_value,
      monthlyRate,
      remainingInstallments
    );
    
    // Total a pagar se seguir até o fim
    const totalFuturePayments = debt.installment_value * remainingInstallments;
    
    // Economia em juros
    const interestSavings = totalFuturePayments - currentPayoffAmount;
    
    // Score de recomendação
    const recommendationScore = this.calculateRecommendationScore(
      debt,
      interestSavings,
      remainingInstallments,
      monthlyRate
    );
    
    return {
      currentPayoffAmount: Math.round(currentPayoffAmount * 100) / 100,
      totalFuturePayments: Math.round(totalFuturePayments * 100) / 100,
      interestSavings: Math.round(interestSavings * 100) / 100,
      remainingInstallments,
      monthlyInterestRate: monthlyRate * 100,
      annualInterestRate: Math.round(annualRate * 100) / 100,
      recommendationScore: Math.round(recommendationScore),
      isRecommended: recommendationScore >= 70,
      totalDebtWithInterest: debt.total_debt_amount,
      totalDebtWithoutInterest: debt.financed_amount,
    };
  }

  private static calculateImpliedMonthlyRate(debt: DebtData): number {
    // Usar taxa implícita baseada no total de juros e prazo
    const totalInterest = debt.total_debt_amount - debt.financed_amount;
    const avgMonthlyInterest = totalInterest / debt.total_installments / debt.financed_amount;
    
    // Garantir uma taxa mínima realista
    return Math.max(0.005, avgMonthlyInterest); // Mínimo de 0.5% ao mês
  }

  private static calculatePresentValue(payment: number, rate: number, periods: number): number {
    if (rate === 0) return payment * periods;
    return payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
  }

  private static calculateRecommendationScore(
    debt: DebtData,
    savings: number,
    monthsRemaining: number,
    monthlyRate: number
  ): number {
    let score = 50; // Base score
    
    // Fator 1: Percentual de economia (peso: 40%)
    const savingsPercentage = (savings / debt.remaining_balance) * 100;
    score += Math.min(40, savingsPercentage * 2);
    
    // Fator 2: Tempo restante (peso: 20%)
    // Menos tempo = maior score para quitação
    const timeScore = Math.max(0, 20 - (monthsRemaining / 6));
    score += timeScore;
    
    // Fator 3: Taxa de juros (peso: 30%)
    const annualRate = ((1 + monthlyRate) ** 12 - 1) * 100;
    if (annualRate > 25) score += 30;
    else if (annualRate > 15) score += 25;
    else if (annualRate > 10) score += 15;
    else if (annualRate > 5) score += 10;
    
    // Fator 4: Volume da dívida (peso: 10%)
    // Dívidas maiores têm mais impacto na economia
    if (debt.remaining_balance > 50000) score += 10;
    else if (debt.remaining_balance > 20000) score += 8;
    else if (debt.remaining_balance > 10000) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  private static createEmptyCalculation(): EarlyPayoffCalculation {
    return {
      currentPayoffAmount: 0,
      totalFuturePayments: 0,
      interestSavings: 0,
      remainingInstallments: 0,
      monthlyInterestRate: 0,
      annualInterestRate: 0,
      recommendationScore: 0,
      isRecommended: false,
      totalDebtWithInterest: 0,
      totalDebtWithoutInterest: 0,
    };
  }

  // Método preparado para futuras integrações com IA e análise de fluxo de caixa
  static async calculateAdvancedRecommendation(
    debt: DebtData,
    userCashFlow?: any,
    emergencyReserve?: number,
    investmentOpportunities?: any[]
  ): Promise<EarlyPayoffCalculation & { advancedInsights?: string[] }> {
    // Base calculation
    const baseCalculation = this.calculateEarlyPayoff(debt);
    
    // Placeholder para futuras melhorias com IA
    const advancedInsights: string[] = [];
    
    // TODO: Integrar com módulo de fluxo de caixa
    if (userCashFlow) {
      advancedInsights.push("Análise de impacto no fluxo de caixa será implementada em breve");
    }
    
    // TODO: Integrar com módulo de reserva de emergência
    if (emergencyReserve) {
      advancedInsights.push("Consideração da reserva de emergência será implementada em breve");
    }
    
    // TODO: Integrar com módulo de oportunidades de investimento
    if (investmentOpportunities) {
      advancedInsights.push("Comparação com oportunidades de investimento será implementada em breve");
    }
    
    return {
      ...baseCalculation,
      advancedInsights
    };
  }
}
