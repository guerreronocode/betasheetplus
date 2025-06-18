
export interface InvestmentCalculatorInput {
  investmentType: string;
  yieldType: 'fixed' | 'selic' | 'cdi' | 'ipca';
  initialAmount: number;
  monthlyAmount: number;
  annualRate: number;
  timeInMonths: number;
}

export interface InvestmentProjection {
  initialAmount: number;
  monthlyAmount: number;
  timeInMonths: number;
  annualRate: number;
  totalInvested: number;
  totalYield: number;
  finalAmount: number;
  yieldPercentage: number;
  monthlyData: Array<{
    month: number;
    invested: number;
    accumulated: number;
    yield: number;
  }>;
}

export class InvestmentCalculatorService {
  static calculateProjection(input: InvestmentCalculatorInput): InvestmentProjection {
    const { initialAmount, monthlyAmount, annualRate, timeInMonths } = input;
    
    // Taxa mensal
    const monthlyRate = annualRate / 100 / 12;
    
    const monthlyData: Array<{
      month: number;
      invested: number;
      accumulated: number;
      yield: number;
    }> = [];
    
    let currentValue = initialAmount;
    let totalInvested = initialAmount;
    
    // Primeiro mês
    monthlyData.push({
      month: 0,
      invested: initialAmount,
      accumulated: initialAmount,
      yield: 0,
    });
    
    // Calcular evolução mês a mês
    for (let month = 1; month <= timeInMonths; month++) {
      // Aplicar rendimento sobre o valor atual
      currentValue = currentValue * (1 + monthlyRate);
      
      // Adicionar aporte mensal
      currentValue += monthlyAmount;
      totalInvested += monthlyAmount;
      
      const totalYield = currentValue - totalInvested;
      
      monthlyData.push({
        month,
        invested: totalInvested,
        accumulated: currentValue,
        yield: totalYield,
      });
    }
    
    const finalAmount = currentValue;
    const totalYield = finalAmount - totalInvested;
    const yieldPercentage = totalInvested > 0 ? (totalYield / totalInvested) * 100 : 0;
    
    return {
      initialAmount,
      monthlyAmount,
      timeInMonths,
      annualRate,
      totalInvested,
      totalYield,
      finalAmount,
      yieldPercentage,
      monthlyData,
    };
  }

  // Método preparado para futuras integrações com taxas dinâmicas
  static async calculateAdvancedProjection(
    input: InvestmentCalculatorInput,
    marketRates?: { selic: number; cdi: number; ipca: number }
  ): Promise<InvestmentProjection & { marketAdjustedRate?: number }> {
    // Base calculation
    const baseProjection = this.calculateProjection(input);
    
    // TODO: Integrar com taxas de mercado em tempo real
    let marketAdjustedRate: number | undefined;
    
    if (marketRates && input.yieldType !== 'fixed') {
      switch (input.yieldType) {
        case 'selic':
          marketAdjustedRate = marketRates.selic;
          break;
        case 'cdi':
          marketAdjustedRate = marketRates.cdi * 0.9; // Aproximação típica
          break;
        case 'ipca':
          marketAdjustedRate = marketRates.ipca + (input.annualRate / 100);
          break;
      }
      
      if (marketAdjustedRate) {
        const adjustedInput = { ...input, annualRate: marketAdjustedRate * 100 };
        const adjustedProjection = this.calculateProjection(adjustedInput);
        return { ...adjustedProjection, marketAdjustedRate };
      }
    }
    
    return { ...baseProjection, marketAdjustedRate };
  }

  // Método para comparar diferentes cenários
  static compareScenarios(scenarios: InvestmentCalculatorInput[]): Array<InvestmentProjection & { scenarioName: string }> {
    return scenarios.map((scenario, index) => ({
      ...this.calculateProjection(scenario),
      scenarioName: `Cenário ${index + 1}`,
    }));
  }
}
