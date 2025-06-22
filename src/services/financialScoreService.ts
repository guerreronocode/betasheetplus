
import { IncomeEntry, ExpenseEntry, Investment, BankAccount } from '@/hooks/useFinancialData';
import { DebtData } from './debtService';

export interface ScoreCriteria {
  debt: number;        // 0-100
  emergency: number;   // 0-100
  spending: number;    // 0-100
  investment: number;  // 0-100
  diversification: number; // 0-100
}

export interface ScoreDetails {
  score: number;
  criteria: ScoreCriteria;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  level: 'excellent' | 'good' | 'unstable' | 'critical';
}

export interface FinancialScoreInput {
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  investments: Investment[];
  bankAccounts: BankAccount[];
  debts: DebtData[];
  emergencyReserveTarget: number;
  emergencyReserveCurrent: number;
}

export class FinancialScoreService {
  // Pesos dos critérios (soma = 100%)
  private static readonly WEIGHTS = {
    debt: 0.25,           // 25% - Endividamento
    emergency: 0.30,      // 30% - Reserva de emergência
    spending: 0.20,       // 20% - Organização dos gastos
    investment: 0.15,     // 15% - Investimentos ativos
    diversification: 0.10 // 10% - Diversificação
  };

  static calculateScore(input: FinancialScoreInput): ScoreDetails {
    const criteria = this.calculateCriteria(input);
    
    // Cálculo do score final (média ponderada)
    const score = Math.round(
      criteria.debt * this.WEIGHTS.debt +
      criteria.emergency * this.WEIGHTS.emergency +
      criteria.spending * this.WEIGHTS.spending +
      criteria.investment * this.WEIGHTS.investment +
      criteria.diversification * this.WEIGHTS.diversification
    );

    const level = this.getScoreLevel(score);
    const strengths = this.identifyStrengths(criteria);
    const weaknesses = this.identifyWeaknesses(criteria);
    const recommendations = this.generateRecommendations(criteria);

    return {
      score,
      criteria,
      strengths,
      weaknesses,
      recommendations,
      level
    };
  }

  private static calculateCriteria(input: FinancialScoreInput): ScoreCriteria {
    return {
      debt: this.calculateDebtScore(input),
      emergency: this.calculateEmergencyScore(input),
      spending: this.calculateSpendingScore(input),
      investment: this.calculateInvestmentScore(input),
      diversification: this.calculateDiversificationScore(input)
    };
  }

  // 1️⃣ Score de Endividamento
  private static calculateDebtScore(input: FinancialScoreInput): number {
    const monthlyIncome = this.getMonthlyIncome(input.income);
    if (monthlyIncome <= 0) return 50; // Score neutro se não há renda registrada

    // Calcular total de dívidas mensais
    const monthlyDebtPayments = input.debts
      .filter(debt => debt.status === 'active')
      .reduce((sum, debt) => sum + debt.installment_value, 0);

    const debtToIncomeRatio = (monthlyDebtPayments / monthlyIncome) * 100;

    if (debtToIncomeRatio <= 10) return 100; // Excelente
    if (debtToIncomeRatio <= 30) return 70;  // Aceitável
    if (debtToIncomeRatio <= 50) return 40;  // Ruim
    return 20; // Crítico
  }

  // 2️⃣ Score de Reserva de Emergência
  private static calculateEmergencyScore(input: FinancialScoreInput): number {
    if (input.emergencyReserveTarget <= 0) return 30; // Score baixo se não há meta definida

    const reservePercentage = (input.emergencyReserveCurrent / input.emergencyReserveTarget) * 100;

    if (reservePercentage >= 100) return 100; // Excelente
    if (reservePercentage >= 80) return 90;   // Muito bom
    if (reservePercentage >= 40) return 60;   // Em construção
    if (reservePercentage >= 20) return 35;   // Insuficiente
    return 15; // Crítico
  }

  // 3️⃣ Score de Organização dos Gastos
  private static calculateSpendingScore(input: FinancialScoreInput): number {
    const last3MonthsData = this.getLast3MonthsData(input.income, input.expenses);
    
    if (last3MonthsData.length === 0) return 50; // Neutro se não há dados

    let totalScore = 0;
    let validMonths = 0;

    last3MonthsData.forEach(monthData => {
      if (monthData.income > 0) {
        const spendingRatio = (monthData.expenses / monthData.income) * 100;
        
        if (spendingRatio < 90) totalScore += 100;      // Excelente
        else if (spendingRatio <= 100) totalScore += 60; // Atenção
        else totalScore += 20; // Crítico
        
        validMonths++;
      }
    });

    return validMonths > 0 ? Math.round(totalScore / validMonths) : 50;
  }

  // 4️⃣ Score de Investimentos Ativos
  private static calculateInvestmentScore(input: FinancialScoreInput): number {
    const hasInvestments = input.investments.length > 0;
    
    if (!hasInvestments) return 20; // Crítico

    // Verificar se investe regularmente (últimos 3 meses)
    const recentInvestments = input.investments.filter(inv => {
      const investmentDate = new Date(inv.purchase_date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return investmentDate >= threeMonthsAgo;
    });

    const totalInvestmentValue = input.investments.reduce((sum, inv) => 
      sum + (inv.current_value || inv.amount), 0);

    if (recentInvestments.length >= 2 && totalInvestmentValue > 1000) return 100; // Excelente
    if (recentInvestments.length >= 1 || totalInvestmentValue > 500) return 70;   // Bom
    return 45; // Intermediário
  }

  // 5️⃣ Score de Diversificação
  private static calculateDiversificationScore(input: FinancialScoreInput): number {
    if (input.investments.length === 0) return 20; // Crítico

    const liquidityTypes = new Set(input.investments.map(inv => inv.liquidity));
    const investmentTypes = new Set(input.investments.map(inv => inv.type));

    let diversificationScore = 0;

    // Diversificação por liquidez
    if (liquidityTypes.size >= 3) diversificationScore += 50;
    else if (liquidityTypes.size >= 2) diversificationScore += 35;
    else diversificationScore += 15;

    // Diversificação por tipo
    if (investmentTypes.size >= 3) diversificationScore += 50;
    else if (investmentTypes.size >= 2) diversificationScore += 35;
    else diversificationScore += 15;

    return Math.min(100, diversificationScore);
  }

  // Métodos auxiliares
  private static getMonthlyIncome(income: IncomeEntry[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return income
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private static getLast3MonthsData(income: IncomeEntry[], expenses: ExpenseEntry[]) {
    const monthsData = [];
    
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      
      const monthIncome = income
        .filter(item => {
          const date = new Date(item.date);
          return date.getMonth() === targetDate.getMonth() && 
                 date.getFullYear() === targetDate.getFullYear();
        })
        .reduce((sum, item) => sum + item.amount, 0);

      const monthExpenses = expenses
        .filter(item => {
          const date = new Date(item.date);
          return date.getMonth() === targetDate.getMonth() && 
                 date.getFullYear() === targetDate.getFullYear();
        })
        .reduce((sum, item) => sum + item.amount, 0);

      monthsData.push({ income: monthIncome, expenses: monthExpenses });
    }
    
    return monthsData;
  }

  private static getScoreLevel(score: number): 'excellent' | 'good' | 'unstable' | 'critical' {
    if (score >= 81) return 'excellent';
    if (score >= 61) return 'good';
    if (score >= 41) return 'unstable';
    return 'critical';
  }

  private static identifyStrengths(criteria: ScoreCriteria): string[] {
    const strengths = [];
    
    if (criteria.debt >= 70) strengths.push('Baixo endividamento');
    if (criteria.emergency >= 80) strengths.push('Reserva de emergência robusta');
    if (criteria.spending >= 70) strengths.push('Gastos organizados');
    if (criteria.investment >= 70) strengths.push('Investe regularmente');
    if (criteria.diversification >= 60) strengths.push('Portfólio diversificado');

    return strengths.length > 0 ? strengths : ['Continue trabalhando em sua organização financeira'];
  }

  private static identifyWeaknesses(criteria: ScoreCriteria): string[] {
    const weaknesses = [];
    
    if (criteria.debt < 50) weaknesses.push('Alto endividamento compromete o orçamento');
    if (criteria.emergency < 60) weaknesses.push('Reserva de emergência insuficiente');
    if (criteria.spending < 50) weaknesses.push('Gastos desorganizados ou acima da renda');
    if (criteria.investment < 40) weaknesses.push('Falta de investimentos ativos');
    if (criteria.diversification < 40) weaknesses.push('Investimentos pouco diversificados');

    return weaknesses;
  }

  private static generateRecommendations(criteria: ScoreCriteria): string[] {
    const recommendations = [];
    
    // Priorizar por ordem de importância
    if (criteria.emergency < 60) {
      recommendations.push('🛡️ Priorize construir sua reserva de emergência');
    }
    
    if (criteria.debt < 50) {
      recommendations.push('💳 Organize e quite suas dívidas para reduzir juros');
    }
    
    if (criteria.spending < 50) {
      recommendations.push('📊 Monitore seus gastos e ajuste o orçamento');
    }
    
    if (criteria.investment < 40) {
      recommendations.push('📈 Comece a investir, mesmo com valores pequenos');
    }
    
    if (criteria.diversification < 40 && criteria.investment >= 40) {
      recommendations.push('🎯 Diversifique seus investimentos em diferentes prazos');
    }

    return recommendations.length > 0 ? 
      recommendations : 
      ['🎉 Parabéns! Continue mantendo sua disciplina financeira'];
  }
}
