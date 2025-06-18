
import { supabase } from '@/integrations/supabase/client';

export interface DebtFormData {
  creditor: string;
  description: string;
  financedAmount: string;
  startDate: string;
  dueDate: string;
  totalInstallments: string;
  installmentValue: string;
  paidInstallments: string;
  status: 'active' | 'paid' | 'overdue' | 'renegotiated';
  notes?: string;
  category?: string; // Nova propriedade para categorização
}

export interface DebtData {
  id?: string;
  user_id: string;
  creditor: string;
  description: string;
  financed_amount: number;
  start_date: string;
  due_date: string;
  total_installments: number;
  installment_value: number;
  paid_installments: number;
  status: 'active' | 'paid' | 'overdue' | 'renegotiated';
  notes?: string;
  category?: string; // Nova propriedade para categorização
  // Campos calculados
  total_debt_amount: number;
  remaining_balance: number;
  total_interest_amount: number;
  total_interest_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface EarlyPayoffSimulation {
  currentPayoffAmount: number;
  remainingInterest: number;
  totalSavings: number;
  recommendationScore: number;
  monthsRemaining: number;
  isRecommended: boolean;
}

export class DebtCalculationService {
  static calculateDebtMetrics(formData: DebtFormData): {
    totalDebtAmount: number;
    remainingBalance: number;
    totalInterestAmount: number;
    totalInterestPercentage: number;
  } {
    const financedAmount = parseFloat(formData.financedAmount || '0');
    const installmentValue = parseFloat(formData.installmentValue || '0');
    const totalInstallments = parseInt(formData.totalInstallments || '0');
    const paidInstallments = parseInt(formData.paidInstallments || '0');

    const totalDebtAmount = installmentValue * totalInstallments;
    const totalInterestAmount = totalDebtAmount - financedAmount;
    const totalInterestPercentage = financedAmount > 0 ? (totalInterestAmount / financedAmount) * 100 : 0;
    const remainingInstallments = totalInstallments - paidInstallments;
    const remainingBalance = installmentValue * remainingInstallments;

    return {
      totalDebtAmount,
      remainingBalance,
      totalInterestAmount,
      totalInterestPercentage,
    };
  }

  static simulateEarlyPayoff(debt: DebtData): EarlyPayoffSimulation {
    const remainingInstallments = debt.total_installments - debt.paid_installments;
    const monthsRemaining = remainingInstallments;
    
    // Calcular taxa de juros mensal implícita
    const monthlyRate = this.calculateImpliedMonthlyRate(debt);
    
    // Valor presente das parcelas restantes (valor para quitar hoje)
    const currentPayoffAmount = this.calculatePresentValue(
      debt.installment_value,
      monthlyRate,
      remainingInstallments
    );
    
    // Juros futuros que deixará de pagar
    const remainingInterest = (debt.installment_value * remainingInstallments) - currentPayoffAmount;
    
    // Economia total
    const totalSavings = remainingInterest;
    
    // Score de recomendação (0-100) - base simples para futuras melhorias com IA
    const recommendationScore = this.calculateRecommendationScore(debt, totalSavings, monthsRemaining);
    
    return {
      currentPayoffAmount,
      remainingInterest,
      totalSavings,
      recommendationScore,
      monthsRemaining,
      isRecommended: recommendationScore >= 70,
    };
  }

  private static calculateImpliedMonthlyRate(debt: DebtData): number {
    // Calcular taxa mensal implícita usando aproximação
    const totalPaid = debt.installment_value * debt.total_installments;
    const totalInterest = totalPaid - debt.financed_amount;
    const monthlyInterestRate = (totalInterest / debt.financed_amount) / debt.total_installments;
    return Math.max(0.005, monthlyInterestRate); // Mínimo de 0.5% ao mês
  }

  private static calculatePresentValue(payment: number, rate: number, periods: number): number {
    if (rate === 0) return payment * periods;
    return payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
  }

  private static calculateRecommendationScore(debt: DebtData, savings: number, monthsRemaining: number): number {
    // Algoritmo base para score de recomendação (futuras melhorias com IA)
    let score = 50; // Base score
    
    // Maior economia = maior score
    const savingsPercentage = (savings / debt.remaining_balance) * 100;
    score += Math.min(30, savingsPercentage * 2);
    
    // Menos tempo restante = maior score
    score += Math.max(0, 20 - monthsRemaining);
    
    // Taxa de juros alta = maior score para quitação
    if (debt.total_interest_percentage > 20) score += 15;
    else if (debt.total_interest_percentage > 10) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  static validateForm(formData: DebtFormData): string | null {
    if (!formData.creditor.trim()) return "Nome do credor é obrigatório";
    if (!formData.description.trim()) return "Descrição da dívida é obrigatória";
    if (!formData.financedAmount || parseFloat(formData.financedAmount) <= 0) {
      return "Valor financiado deve ser maior que zero";
    }
    if (!formData.startDate) return "Data de início é obrigatória";
    if (!formData.dueDate) return "Data de vencimento é obrigatória";
    if (!formData.totalInstallments || parseInt(formData.totalInstallments) <= 0) {
      return "Número de parcelas deve ser maior que zero";
    }
    if (!formData.installmentValue || parseFloat(formData.installmentValue) <= 0) {
      return "Valor da parcela deve ser maior que zero";
    }
    
    const paidInstallments = parseInt(formData.paidInstallments || '0');
    const totalInstallments = parseInt(formData.totalInstallments || '0');
    
    if (paidInstallments > totalInstallments) {
      return "Parcelas pagas não pode ser maior que o total de parcelas";
    }

    if (new Date(formData.startDate) > new Date(formData.dueDate)) {
      return "Data de início não pode ser posterior à data de vencimento";
    }

    return null;
  }
}

export class DebtDataService {
  static formToDebtData(formData: DebtFormData, userId: string): DebtData {
    const metrics = DebtCalculationService.calculateDebtMetrics(formData);
    
    return {
      user_id: userId,
      creditor: formData.creditor,
      description: formData.description,
      financed_amount: parseFloat(formData.financedAmount),
      start_date: formData.startDate,
      due_date: formData.dueDate,
      total_installments: parseInt(formData.totalInstallments),
      installment_value: parseFloat(formData.installmentValue),
      paid_installments: parseInt(formData.paidInstallments || '0'),
      status: formData.status,
      notes: formData.notes,
      category: formData.category,
      total_debt_amount: metrics.totalDebtAmount,
      remaining_balance: metrics.remainingBalance,
      total_interest_amount: metrics.totalInterestAmount,
      total_interest_percentage: metrics.totalInterestPercentage,
    };
  }

  static async createDebt(debtData: DebtData) {
    console.log('Creating debt:', debtData);
    const { data, error } = await supabase
      .from('debts')
      .insert(debtData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating debt:', error);
      throw error;
    }
    return data;
  }

  static async updateDebt(id: string, debtData: Partial<DebtData>) {
    console.log('Updating debt:', id, debtData);
    const { data, error } = await supabase
      .from('debts')
      .update(debtData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
    return data;
  }

  static async deleteDebt(id: string, userId: string) {
    console.log('Deleting debt:', id, 'for user:', userId);
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  }

  static async getUserDebts(userId: string) {
    console.log('Fetching debts for user:', userId);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching debts:', error);
      throw error;
    }
    return data as DebtData[];
  }

  static async markAsPaid(id: string, userId: string) {
    console.log('Marking debt as paid:', id);
    const { data, error } = await supabase
      .from('debts')
      .update({ 
        status: 'paid',
        paid_installments: supabase.rpc('get_total_installments', { debt_id: id }),
        remaining_balance: 0
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking debt as paid:', error);
      throw error;
    }
    return data;
  }
}

export class DebtFormFactory {
  static createEmptyForm(): DebtFormData {
    return {
      creditor: '',
      description: '',
      financedAmount: '',
      startDate: '',
      dueDate: '',
      totalInstallments: '',
      installmentValue: '',
      paidInstallments: '0',
      status: 'active',
      notes: '',
      category: '',
    };
  }

  static createEditForm(debt: DebtData): DebtFormData {
    return {
      creditor: debt.creditor,
      description: debt.description,
      financedAmount: debt.financed_amount.toString(),
      startDate: debt.start_date,
      dueDate: debt.due_date,
      totalInstallments: debt.total_installments.toString(),
      installmentValue: debt.installment_value.toString(),
      paidInstallments: debt.paid_installments.toString(),
      status: debt.status,
      notes: debt.notes || '',
      category: debt.category || '',
    };
  }
}
