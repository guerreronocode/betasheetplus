
interface CalculationParams {
  initialAmount: number;
  monthlyAmount: number;
  annualRate: number;
  periodMonths: number;
}

interface MonthlyData {
  month: number;
  invested: number;
  accumulated: number;
  yield: number;
}

interface CalculationResult {
  totalInvested: number;
  finalAmount: number;
  totalReturn: number;
  returnPercentage: number;
  monthlyData: MonthlyData[];
}

export class InvestmentCalculatorService {
  static calculateInvestment(params: CalculationParams): CalculationResult {
    const { initialAmount, monthlyAmount, annualRate, periodMonths } = params;
    
    // Taxa mensal
    const monthlyRate = annualRate / 100 / 12;
    
    const monthlyData: MonthlyData[] = [];
    let accumulated = initialAmount;
    let totalInvested = initialAmount;

    // Mês 0 (investimento inicial)
    monthlyData.push({
      month: 0,
      invested: totalInvested,
      accumulated: accumulated,
      yield: 0
    });

    // Calcular mês a mês
    for (let month = 1; month <= periodMonths; month++) {
      // Adicionar rendimento do mês
      accumulated = accumulated * (1 + monthlyRate);
      
      // Adicionar aporte mensal
      accumulated += monthlyAmount;
      totalInvested += monthlyAmount;
      
      const currentYield = accumulated - totalInvested;

      monthlyData.push({
        month,
        invested: totalInvested,
        accumulated: accumulated,
        yield: currentYield
      });
    }

    const finalAmount = accumulated;
    const totalReturn = finalAmount - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    return {
      totalInvested,
      finalAmount,
      totalReturn,
      returnPercentage,
      monthlyData
    };
  }

  static calculateCompoundInterest(
    principal: number,
    monthlyAddition: number,
    annualRate: number,
    months: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    
    // Valor futuro do principal
    const futurePrincipal = principal * Math.pow(1 + monthlyRate, months);
    
    // Valor futuro dos aportes mensais (série de pagamentos)
    const futureAdditions = monthlyAddition * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    return futurePrincipal + futureAdditions;
  }

  static getYieldTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      pre: 'Taxa pré-fixada - Você sabe exatamente quanto receberá',
      pos: 'Pós-fixado - Rentabilidade varia conforme o CDI',
      ipca: 'IPCA+ - Proteção contra inflação + taxa fixa'
    };
    
    return descriptions[type] || 'Tipo de rentabilidade';
  }

  static getInvestmentTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      cdb: 'Certificado de Depósito Bancário',
      tesouro: 'Títulos do Tesouro Nacional',
      debentures: 'Títulos de dívida corporativa',
      lci_lca: 'Isentos de IR - Crédito Imobiliário/Agronegócio',
      tesouro_direto: 'Tesouro Direto - Governo Federal'
    };
    
    return descriptions[type] || 'Tipo de investimento';
  }
}
