
import * as z from 'zod';

// Schema do Zod para validação
export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  credit_limit: z.number().min(0, 'Limite deve ser positivo'),
  closing_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  due_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
});

export const purchaseSchema = z.object({
  credit_card_id: z.string().min(1, 'Selecione um cartão'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  purchase_date: z.string().min(1, 'Data é obrigatória'),
  installments: z.number().min(1, 'Parcelas deve ser ao menos 1').max(36, 'Máximo 36 parcelas'),
});

// Tipos TypeScript derivados do Zod
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;

// Interface completa do cartão de crédito no banco
export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active: boolean;
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
  created_at: string;
  updated_at: string;
}
