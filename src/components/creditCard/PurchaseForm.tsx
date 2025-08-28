
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardPurchases } from '@/hooks/useCreditCardPurchases';
import { useUnifiedCategories } from '@/hooks/useUnifiedCategories';
import { formatDateForDatabase, getTodayForInput } from "@/utils/formatters";
import { X } from 'lucide-react';
import * as z from 'zod';

interface PurchaseFormProps {
  onClose: () => void;
}

// Schema simplificado para o formulário
const simplifiedPurchaseSchema = z.object({
  credit_card_id: z.string().min(1, 'Selecione um cartão'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  purchase_date: z.string().min(1, 'Data é obrigatória'),
  installments: z.number().min(1, 'Parcelas deve ser ao menos 1').max(36, 'Máximo 36 parcelas'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  installment_value: z.number().min(0.01, 'Valor da parcela deve ser maior que zero'),
});

type SimplifiedPurchaseFormData = z.infer<typeof simplifiedPurchaseSchema>;

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose }) => {
  const { creditCards } = useCreditCards();
  const { createPurchase, isCreating } = useCreditCardPurchases();
  const { categories } = useUnifiedCategories();

  const form = useForm<SimplifiedPurchaseFormData>({
    resolver: zodResolver(simplifiedPurchaseSchema),
    defaultValues: {
      credit_card_id: '',
      description: '',
      amount: 0,
      purchase_date: getTodayForInput(),
      installments: 1,
      category: '',
      installment_value: 0,
    },
    mode: 'onChange',
  });

  const amount = form.watch('amount');
  const installments = form.watch('installments');
  const installmentValue = form.watch('installment_value');

  // Calcular o total das parcelas
  const totalInstallments = installmentValue * installments;
  const difference = totalInstallments - amount;
  const hasInterest = difference > 0.01;
  const interestPercentage = amount > 0 ? (difference / amount) * 100 : 0;

  // Atualizar valor da parcela quando o valor total ou número de parcelas mudar
  React.useEffect(() => {
    if (amount > 0 && installments > 0) {
      const defaultInstallmentValue = amount / installments;
      form.setValue('installment_value', Number(defaultInstallmentValue.toFixed(2)));
    }
  }, [amount, installments, form]);

  const onSubmit = (data: SimplifiedPurchaseFormData) => {
    console.log('Submitting simplified purchase form:', data);
    
    // Usar processo padrão do banco - o trigger criará as parcelas automaticamente
    const submitData = {
      credit_card_id: data.credit_card_id,
      description: data.description,
      amount: totalInstallments, // Usar o total das parcelas (com juros se houver)
      purchase_date: formatDateForDatabase(data.purchase_date),
      installments: data.installments,
      category: data.category,
    };
    
    console.log('Final submit data:', submitData);
    createPurchase(submitData);
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nova Compra</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Compra</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credit_card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartão de Crédito</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cartão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Compra</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra no supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total da Compra</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="36"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installment_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Parcela</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resumo dos valores */}
            {installments > 0 && installmentValue > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
                <h4 className="font-medium text-sm mb-2">Resumo da Compra</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor da compra:</span>
                  <span className="font-medium">R$ {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor da parcela:</span>
                  <span className="font-medium">R$ {installmentValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total das parcelas:</span>
                  <span className="font-medium">R$ {totalInstallments.toFixed(2)}</span>
                </div>
                
                {hasInterest && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600">Juros (valor):</span>
                      <span className="font-medium text-amber-600">R$ {difference.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600">Juros (%):</span>
                      <span className="font-medium text-amber-600">{interestPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      💰 Você está pagando R$ {difference.toFixed(2)} de juros ({interestPercentage.toFixed(2)}%) sobre o valor da compra.
                    </div>
                  </>
                )}
                
                {!hasInterest && Math.abs(difference) < 0.01 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    ✅ Perfeito! O total das parcelas é igual ao valor da compra.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Registrando...' : 'Registrar Compra'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
