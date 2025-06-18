
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
}

export interface DebtData {
  id?: string;
  user_id?: string;
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
  // Campos calculados
  total_debt_amount: number;
  remaining_balance: number;
  total_interest_amount: number;
  total_interest_percentage: number;
  created_at?: string;
  updated_at?: string;
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
      total_debt_amount: metrics.totalDebtAmount,
      remaining_balance: metrics.remainingBalance,
      total_interest_amount: metrics.totalInterestAmount,
      total_interest_percentage: metrics.totalInterestPercentage,
    };
  }

  static async createDebt(debtData: DebtData) {
    const { data, error } = await supabase
      .from('debts')
      .insert([debtData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateDebt(id: string, debtData: Partial<DebtData>) {
    const { data, error } = await supabase
      .from('debts')
      .update(debtData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteDebt(id: string, userId: string) {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  static async getUserDebts(userId: string) {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DebtData[];
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
    };
  }
}
