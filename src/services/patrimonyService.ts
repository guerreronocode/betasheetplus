import { supabase } from '@/integrations/supabase/client';
import { PatrimonyGroup, patrimonyCategoryRules, getPatrimonyGroupByCategory } from '@/utils/patrimonyHelpers';

// Tipos centralizados
export interface AssetData {
  name: string;
  category: string;
  current_value: number;
  purchase_date: string;
  purchase_value?: number;
  description?: string;
}

export interface LiabilityData {
  name: string;
  category: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment?: number;
  due_date?: string;
  description?: string;
}

export interface PatrimonyFormData {
  name: string;
  value: string;
  category: string;
  id: string;
  isEdit: boolean;
  linkType: string;
  linkedInvestmentId: string;
  linkedBankAccountId: string;
  linkedDebtId: string;
  entryType: 'asset' | 'liability';
}

// Validações centralizadas
export class PatrimonyValidationService {
  static validateAssetForm(form: PatrimonyFormData, investments: any[], bankAccounts: any[]): string | null {
    if (form.linkType === "manual" || !form.linkType) {
      if (!form.name || !form.value || !form.category) {
        return "Preencha todos os campos obrigatórios.";
      }
      const valueNum = parseFloat(String(form.value).replace(",", "."));
      if (isNaN(valueNum) || valueNum < 0) {
        return "Informe um valor positivo.";
      }
      const categoryRule = patrimonyCategoryRules[form.category];
      if (!categoryRule) {
        return "Categoria inválida.";
      }
    }
    
    if (form.linkType === "investment" && form.linkedInvestmentId) {
      const selectedInv = investments.find((inv) => inv.id === form.linkedInvestmentId);
      if (!selectedInv) {
        return "Selecione um investimento válido.";
      }
    }
    
    if (form.linkType === "bank" && form.linkedBankAccountId) {
      const account = bankAccounts.find((acc) => acc.id === form.linkedBankAccountId);
      if (!account) {
        return "Selecione uma conta bancária válida.";
      }
    }
    
    return null;
  }

  static validateLiabilityForm(form: PatrimonyFormData, debts: any[]): string | null {
    if (form.linkType === "manual" || !form.linkType) {
      const { name, value, category } = form;
      const valueNum = Number(String(value).replace(",", "."));

      if (!name || !value || !category) {
        return "Preencha todos os campos obrigatórios.";
      }
      if (isNaN(valueNum) || valueNum < 0) {
        return "Informe um valor positivo.";
      }
      const categoryRule = patrimonyCategoryRules[category];
      if (!categoryRule) {
        return "Categoria inválida.";
      }
    }

    if (form.linkType === "debt" && form.linkedDebtId) {
      const selectedDebt = debts.find((debt) => debt.id === form.linkedDebtId);
      if (!selectedDebt) {
        return "Selecione uma dívida válida.";
      }
    }
    
    return null;
  }
}

// Serviços de dados
export class PatrimonyDataService {
  static async createAsset(userId: string, assetData: AssetData) {
    const { data, error } = await supabase
      .from('assets')
      .insert([{ ...assetData, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAsset(assetId: string, userId: string, assetData: Partial<AssetData>) {
    const { data, error } = await supabase
      .from('assets')
      .update(assetData)
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createLiability(userId: string, liabilityData: LiabilityData) {
    const { data, error } = await supabase
      .from('liabilities')
      .insert([{ ...liabilityData, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateLiability(liabilityId: string, userId: string, liabilityData: Partial<LiabilityData>) {
    const { data, error } = await supabase
      .from('liabilities')
      .update(liabilityData)
      .eq('id', liabilityId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Serviço de transformação de dados
export class PatrimonyTransformService {
  static formToAssetData(form: PatrimonyFormData, investments: any[], bankAccounts: any[]): AssetData {
    if (form.linkType === "investment" && form.linkedInvestmentId) {
      const selectedInv = investments.find((inv) => inv.id === form.linkedInvestmentId);
      return {
        name: selectedInv.name,
        category: "investimento_longo_prazo",
        current_value: selectedInv.current_value,
        purchase_date: selectedInv.purchase_date,
      };
    }
    
    if (form.linkType === "bank" && form.linkedBankAccountId) {
      const account = bankAccounts.find((acc) => acc.id === form.linkedBankAccountId);
      return {
        name: account.name + " (" + account.bank_name + ")",
        category: "conta_corrente",
        current_value: account.balance,
        purchase_date: new Date().toISOString().split("T")[0],
      };
    }
    
    // Manual entry
    const valueNum = parseFloat(String(form.value).replace(",", "."));
    return {
      name: form.name,
      category: form.category,
      current_value: valueNum,
      purchase_date: new Date().toISOString().split("T")[0],
    };
  }

  static formToLiabilityData(form: PatrimonyFormData, debts: any[]): LiabilityData {
    if (form.linkType === "debt" && form.linkedDebtId) {
      const selectedDebt = debts.find((debt) => debt.id === form.linkedDebtId);
      const category = this.mapDebtToCategory(selectedDebt);
      
      return {
        name: `${selectedDebt.description} (${selectedDebt.creditor})`,
        category,
        total_amount: selectedDebt.total_debt_amount,
        remaining_amount: selectedDebt.remaining_balance,
        interest_rate: selectedDebt.total_interest_percentage,
        monthly_payment: selectedDebt.installment_value,
        due_date: selectedDebt.due_date,
        description: selectedDebt.notes,
      };
    }

    // Manual entry
    const valueNum = Number(String(form.value).replace(",", "."));
    return {
      name: form.name,
      category: form.category,
      total_amount: valueNum,
      remaining_amount: valueNum,
      interest_rate: 0,
    };
  }

  static mapDebtToCategory(debt: any): string {
    // Lógica melhorada para mapear dívida para categoria de passivo
    if (!debt) return 'emprestimo_bancario_curto';

    // Se a dívida já tem uma categoria definida, usar ela diretamente
    if (debt.category && patrimonyCategoryRules[debt.category]) {
      return debt.category;
    }

    // Caso contrário, inferir pela descrição e vencimento
    const today = new Date();
    const dueDate = new Date(debt.due_date);
    const monthsUntilDue = (dueDate.getFullYear() - today.getFullYear()) * 12 + 
                          (dueDate.getMonth() - today.getMonth());

    const creditorLower = debt.creditor.toLowerCase();
    const descriptionLower = debt.description.toLowerCase();

    // Identificar por tipo primeiro
    if (creditorLower.includes('cartão') || creditorLower.includes('cartao') ||
        descriptionLower.includes('cartão') || descriptionLower.includes('cartao')) {
      return 'cartao_credito';
    }

    if (descriptionLower.includes('imóvel') || descriptionLower.includes('imovel') ||
        descriptionLower.includes('casa') || descriptionLower.includes('apartamento')) {
      return 'financiamento_imovel';
    }

    if (descriptionLower.includes('carro') || descriptionLower.includes('veículo') ||
        descriptionLower.includes('veiculo') || descriptionLower.includes('auto')) {
      return monthsUntilDue <= 12 ? 'parcelamento' : 'financiamento_carro';
    }

    if (descriptionLower.includes('parcelamento') || descriptionLower.includes('parcela')) {
      return 'parcelamento';
    }

    // Classificar por vencimento
    if (monthsUntilDue <= 12) {
      return 'emprestimo_bancario_curto';
    } else {
      return 'emprestimo_pessoal_longo';
    }
  }
}

// Factory para criação de formulários limpos
export class PatrimonyFormFactory {
  static createEmptyAssetForm(): PatrimonyFormData {
    return {
      entryType: "asset",
      linkType: "manual",
      linkedInvestmentId: "",
      linkedBankAccountId: "",
      linkedDebtId: "",
      value: "",
      name: "",
      category: "",
      isEdit: false,
      id: "",
    };
  }

  static createEmptyLiabilityForm(): PatrimonyFormData {
    return {
      entryType: "liability",
      linkType: "manual",
      linkedInvestmentId: "",
      linkedBankAccountId: "",
      linkedDebtId: "",
      value: "",
      name: "",
      category: "",
      isEdit: false,
      id: "",
    };
  }

  static createEditForm(item: any, entryType: 'asset' | 'liability'): PatrimonyFormData {
    return {
      name: item.name,
      value: String(entryType === 'asset' ? item.current_value : item.remaining_amount),
      category: item.category,
      id: item.id,
      isEdit: true,
      linkType: "manual",
      linkedInvestmentId: "",
      linkedBankAccountId: "",
      linkedDebtId: "",
      entryType,
    };
  }
}
