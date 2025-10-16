import { DebtData } from './debtService';
import { 
  calculateEffectiveMonthlyRate, 
  calculatePriceAmortization, 
  validateDebtData 
} from '@/utils/debtCalculations';

export interface PayoffCalculation {
  debtId: string;
  debtName: string;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  monthsToPayoff: number;
  totalInterest: number;
  order: number;
}

export interface PayoffStrategy {
  strategyName: 'snowball' | 'avalanche';
  totalMonthsToPayoff: number;
  totalInterestSaved: number;
  totalAmount: number;
  monthlyTimeline: PayoffMonthData[];
  debtOrder: PayoffCalculation[];
}

export interface PayoffMonthData {
  month: number;
  remainingDebts: {
    debtId: string;
    debtName: string;
    remainingBalance: number;
  }[];
  totalRemaining: number;
  monthlyPayment: number;
  interestPaid: number;
}

export interface PayoffRecommendation {
  recommendedStrategy: 'snowball' | 'avalanche';
  reason: string;
  confidenceScore: number;
  userProfile: 'conservative' | 'aggressive' | 'balanced';
}

export class DebtPayoffCalculatorService {
  static calculateSnowballStrategy(
    debts: DebtData[],
    extraPayment: number = 0
  ): PayoffStrategy {
    // Ordenar por menor saldo devedor
    const sortedDebts = debts
      .filter(debt => debt.status === 'active' && validateDebtData(debt))
      .sort((a, b) => a.remaining_balance - b.remaining_balance);

    return this.calculateStrategy(sortedDebts, extraPayment, 'snowball');
  }

  static calculateAvalancheStrategy(
    debts: DebtData[],
    extraPayment: number = 0
  ): PayoffStrategy {
    // Ordenar por maior taxa de juros
    const sortedDebts = debts
      .filter(debt => debt.status === 'active' && validateDebtData(debt))
      .sort((a, b) => {
        // Calcular taxa mensal efetiva
        const rateA = calculateEffectiveMonthlyRate(a);
        const rateB = calculateEffectiveMonthlyRate(b);
        return rateB - rateA;
      });

    return this.calculateStrategy(sortedDebts, extraPayment, 'avalanche');
  }

  private static calculateStrategy(
    sortedDebts: DebtData[],
    extraPayment: number,
    strategyName: 'snowball' | 'avalanche'
  ): PayoffStrategy {
    const calculations: PayoffCalculation[] = [];
    const monthlyTimeline: PayoffMonthData[] = [];
    
    let currentMonth = 0;
    const workingDebts = sortedDebts.map(debt => ({
      ...debt,
      currentBalance: debt.remaining_balance,
      monthlyRate: calculateEffectiveMonthlyRate(debt)
    }));

    // Simular mês a mês até quitar todas as dívidas
    while (workingDebts.some(debt => debt.currentBalance > 0)) {
      currentMonth++;
      let monthlyInterest = 0;
      let totalMonthlyPayment = 0;

      // Calcular pagamentos mensais usando sistema Price
      workingDebts.forEach(debt => {
        if (debt.currentBalance > 0) {
          const { interest, amortization, newBalance } = calculatePriceAmortization(
            debt.currentBalance,
            debt.installment_value,
            debt.monthlyRate
          );
          
          debt.currentBalance = newBalance;
          monthlyInterest += interest;
          totalMonthlyPayment += Math.min(debt.installment_value, debt.currentBalance + interest);
        }
      });

      // Aplicar pagamento extra na primeira dívida ativa (100% no principal)
      if (extraPayment > 0) {
        const firstActiveDebt = workingDebts.find(debt => debt.currentBalance > 0);
        if (firstActiveDebt) {
          const extraApplied = Math.min(extraPayment, firstActiveDebt.currentBalance);
          firstActiveDebt.currentBalance -= extraApplied;
          totalMonthlyPayment += extraApplied;
        }
      }

      // Registrar estado do mês
      monthlyTimeline.push({
        month: currentMonth,
        remainingDebts: workingDebts
          .filter(debt => debt.currentBalance > 0)
          .map(debt => ({
            debtId: debt.id!,
            debtName: `${debt.creditor} - ${debt.description}`,
            remainingBalance: debt.currentBalance
          })),
        totalRemaining: workingDebts.reduce((sum, debt) => sum + debt.currentBalance, 0),
        monthlyPayment: totalMonthlyPayment,
        interestPaid: monthlyInterest
      });

      // Evitar loop infinito
      if (currentMonth > 600) break; // Máximo 50 anos
    }

    // Preparar cálculos finais
    sortedDebts.forEach((debt, index) => {
      calculations.push({
        debtId: debt.id!,
        debtName: `${debt.creditor} - ${debt.description}`,
        currentBalance: debt.remaining_balance,
        monthlyPayment: debt.installment_value,
        interestRate: calculateEffectiveMonthlyRate(debt) * 100,
        monthsToPayoff: debt.total_installments - debt.paid_installments,
        totalInterest: debt.total_interest_amount,
        order: index + 1
      });
    });

    const totalInterest = monthlyTimeline.reduce((sum, month) => sum + month.interestPaid, 0);
    const totalAmount = sortedDebts.reduce((sum, debt) => sum + debt.remaining_balance, 0);

    return {
      strategyName,
      totalMonthsToPayoff: currentMonth,
      totalInterestSaved: 0, // Será calculado em compareStrategies
      totalAmount,
      monthlyTimeline,
      debtOrder: calculations
    };
  }


  static calculateRecommendation(
    userProfile: any, // Dados do usuário para análise
    debts: DebtData[]
  ): PayoffRecommendation {
    // Calcular ambas as estratégias
    const snowball = this.calculateSnowballStrategy(debts);
    const avalanche = this.calculateAvalancheStrategy(debts);
    
    // Diferença de meses entre estratégias
    const monthsDifference = snowball.totalMonthsToPayoff - avalanche.totalMonthsToPayoff;
    
    // Fatores de análise do perfil do usuário
    let profileScore = 50; // Base neutra
    
    // Fator 1: Número de dívidas pequenas (favorece snowball)
    const smallDebts = debts.filter(debt => debt.remaining_balance < 5000).length;
    if (smallDebts >= 3) profileScore -= 15;
    
    // Fator 2: Diferença significativa no tempo (favorece avalanche se economiza muito tempo)
    if (monthsDifference > 6) profileScore += 20;
    else if (monthsDifference < -3) profileScore -= 10;
    
    // Fator 3: Valor total das dívidas (dívidas maiores favorecem avalanche)
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remaining_balance, 0);
    if (totalDebt > 50000) profileScore += 10;
    else if (totalDebt < 15000) profileScore -= 10;
    
    // Fator 4: Dispersão das taxas de juros
    const rates = debts.map(debt => calculateEffectiveMonthlyRate(debt));
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const rateSpread = (maxRate - minRate) * 100;
    
    if (rateSpread > 2) profileScore += 15; // Grande diferença favorece avalanche
    
    // Determinar recomendação
    const recommendedStrategy = profileScore >= 50 ? 'avalanche' : 'snowball';
    const confidenceScore = Math.abs(profileScore - 50) * 2;
    
    let reason = '';
    let userProfileType: 'conservative' | 'aggressive' | 'balanced' = 'balanced';
    
    if (recommendedStrategy === 'avalanche') {
      userProfileType = 'aggressive';
      reason = `Recomendamos a estratégia Avalanche pois você tem bom controle financeiro e pode economizar R$ ${Math.abs(avalanche.totalInterestSaved - snowball.totalInterestSaved).toFixed(2)} em juros, quitando ${Math.abs(monthsDifference)} meses mais cedo.`;
    } else {
      userProfileType = 'conservative';
      reason = `Recomendamos a estratégia Bola de Neve para manter sua motivação alta com vitórias rápidas. Você quitará ${smallDebts} dívidas pequenas logo no início, criando momentum positivo.`;
    }
    
    return {
      recommendedStrategy,
      reason,
      confidenceScore,
      userProfile: userProfileType
    };
  }

  static compareStrategies(debts: DebtData[], extraPayment: number = 0) {
    const snowball = this.calculateSnowballStrategy(debts, extraPayment);
    const avalanche = this.calculateAvalancheStrategy(debts, extraPayment);
    
    // Calcular cenário baseline (sem estratégia - apenas pagamentos mínimos)
    const baseline = this.calculateBaselineStrategy(debts);
    
    // Calcular juros totais de cada estratégia
    const snowballInterest = snowball.monthlyTimeline.reduce((sum, month) => sum + month.interestPaid, 0);
    const avalancheInterest = avalanche.monthlyTimeline.reduce((sum, month) => sum + month.interestPaid, 0);
    const baselineInterest = baseline.monthlyTimeline.reduce((sum, month) => sum + month.interestPaid, 0);
    
    return {
      snowball: {
        ...snowball,
        totalInterestSaved: Math.max(0, baselineInterest - snowballInterest)
      },
      avalanche: {
        ...avalanche,
        totalInterestSaved: Math.max(0, baselineInterest - avalancheInterest)
      },
      recommendation: this.calculateRecommendation({}, debts)
    };
  }

  /**
   * Calcula cenário baseline (sem estratégia de aceleração)
   * Apenas pagamentos mínimos mensais sem priorização
   */
  private static calculateBaselineStrategy(debts: DebtData[]): PayoffStrategy {
    const monthlyTimeline: PayoffMonthData[] = [];
    let currentMonth = 0;
    
    const workingDebts = debts
      .filter(debt => debt.status === 'active' && validateDebtData(debt))
      .map(debt => ({
        ...debt,
        currentBalance: debt.remaining_balance,
        monthlyRate: calculateEffectiveMonthlyRate(debt)
      }));

    while (workingDebts.some(debt => debt.currentBalance > 0)) {
      currentMonth++;
      let monthlyInterest = 0;
      let totalMonthlyPayment = 0;

      workingDebts.forEach(debt => {
        if (debt.currentBalance > 0) {
          const { interest, amortization, newBalance } = calculatePriceAmortization(
            debt.currentBalance,
            debt.installment_value,
            debt.monthlyRate
          );
          
          debt.currentBalance = newBalance;
          monthlyInterest += interest;
          totalMonthlyPayment += Math.min(debt.installment_value, debt.currentBalance + interest);
        }
      });

      monthlyTimeline.push({
        month: currentMonth,
        remainingDebts: workingDebts
          .filter(debt => debt.currentBalance > 0)
          .map(debt => ({
            debtId: debt.id!,
            debtName: `${debt.creditor} - ${debt.description}`,
            remainingBalance: debt.currentBalance
          })),
        totalRemaining: workingDebts.reduce((sum, debt) => sum + debt.currentBalance, 0),
        monthlyPayment: totalMonthlyPayment,
        interestPaid: monthlyInterest
      });

      if (currentMonth > 600) break;
    }

    return {
      strategyName: 'snowball',
      totalMonthsToPayoff: currentMonth,
      totalInterestSaved: 0,
      totalAmount: debts.reduce((sum, debt) => sum + debt.remaining_balance, 0),
      monthlyTimeline,
      debtOrder: []
    };
  }
}
