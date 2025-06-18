
import * as z from 'zod';

// Schema do Zod para validação
export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  credit_limit: z.number().min(0, 'Limite deve ser positivo'),
  closing_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  due_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  include_in_patrimony: z.boolean().optional(),
}).refine((data) => data.closing_day !== data.due_day, {
  message: "Dia de fechamento deve ser diferente do dia de vencimento",
  path: ["due_day"],
});

// Schema para parcelas manuais
export const manualInstallmentSchema = z.object({
  installment_number: z.number().min(1),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
});

export const purchaseSchema = z.object({
  credit_card_id: z.string().min(1, 'Selecione um cartão'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  purchase_date: z.string().min(1, 'Data é obrigatória'),
  installments: z.number().min(1, 'Parcelas deve ser ao menos 1').max(36, 'Máximo 36 parcelas'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  manual_installments: z.array(manualInstallmentSchema).optional(),
}).refine((data) => {
  if (data.manual_installments && data.manual_installments.length > 0) {
    const total = data.manual_installments.reduce((sum, inst) => sum + inst.amount, 0);
    return Math.abs(total - data.amount) < 0.01; // Tolerância para arredondamentos
  }
  return true;
}, {
  message: "A soma das parcelas deve ser igual ao valor total",
  path: ["manual_installments"],
});

export const billPaymentSchema = z.object({
  paid_date: z.string().min(1, 'Data de pagamento é obrigatória'),
  paid_account_id: z.string().min(1, 'Selecione a conta de débito'),
});

// Tipos TypeScript derivados do Zod
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;
export type BillPaymentFormData = z.infer<typeof billPaymentSchema>;
export type ManualInstallmentData = z.infer<typeof manualInstallmentSchema>;

// Tipos para inserção no Supabase
export interface CreditCardInsertData {
  user_id: string;
  name: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  include_in_patrimony?: boolean;
}

export interface PurchaseInsertData {
  user_id: string;
  credit_card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  installments: number;
  category: string;
  manual_installments?: ManualInstallmentData[];
}

// Interface completa do cartão de crédito no banco
export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active: boolean;
  include_in_patrimony: boolean;
  add_to_net_worth: boolean;
  created_at: string;
  updated_at: string;
}

// Interface completa da compra no banco
export interface CreditCardPurchase {
  id: string;
  user_id: string;
  credit_card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  installments: number;
  category: string;
  created_at: string;
  updated_at: string;
  credit_cards?: {
    name: string;
    is_active: boolean;
  };
}

// Interface da fatura com novos campos de auditoria
export interface CreditCardBill {
  id: string;
  user_id: string;
  credit_card_id: string;
  bill_month: string;
  total_amount: number;
  closing_date: string;
  due_date: string;
  is_paid: boolean;
  paid_date?: string;
  paid_account_id?: string;
  paid_at?: string;
  payment_account_id?: string;
  created_at: string;
  updated_at: string;
  credit_cards?: {
    name: string;
    is_active: boolean;
  };
}

// Interface para parcelas com novos campos de auditoria
export interface CreditCardInstallment {
  id: string;
  user_id: string;
  purchase_id: string;
  credit_card_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  bill_month: string;
  is_paid: boolean;
  paid_at?: string;
  payment_account_id?: string;
  created_at: string;
  updated_at: string;
}

// Interface para projeção de limite
export interface CreditLimitProjection {
  month: string;
  projected_available_limit: number;
}

// Interface para status de compras
export interface PurchaseStatus {
  id: string;
  description: string;
  total_amount: number;
  installments: number;
  paid_installments: number;
  remaining_amount: number;
  credit_card_name: string;
  credit_card_active: boolean;
  purchase_date: string;
  category?: string;
}

// Interface para limite disponível corrigido
export interface CreditCardBalance {
  card_id: string;
  card_name: string;
  credit_limit: number;
  total_committed: number;
  available_limit: number;
  is_active: boolean;
}
