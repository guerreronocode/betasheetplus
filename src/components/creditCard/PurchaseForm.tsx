
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
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { purchaseSchema, PurchaseFormData, ManualInstallmentData } from '@/types/creditCard';

interface PurchaseFormProps {
  onClose: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose }) => {
  const { creditCards } = useCreditCards();
  const { createPurchase, isCreating } = useCreditCardPurchases();
  const { categories } = useUnifiedCategories();

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      credit_card_id: '',
      description: '',
      amount: 0,
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      installments: 1,
      category: '',
      manual_installments: [],
    },
    mode: 'onChange',
  });

  const amount = form.watch('amount');
  const installments = form.watch('installments');
  const manualInstallments = form.watch('manual_installments') || [];

  // Gerar parcelas iniciais quando o número de parcelas mudar
  React.useEffect(() => {
    if (installments > 0 && amount > 0) {
      const defaultAmount = amount / installments;
      const newInstallments = Array.from({ length: installments }, (_, index) => ({
        installment_number: index + 1,
        amount: Number(defaultAmount.toFixed(2)),
      }));
      form.setValue('manual_installments', newInstallments);
    }
  }, [installments, amount, form]);

  const handleInstallmentChange = (index: number, value: string) => {
    const newAmount = parseFloat(value) || 0;
    const updated = [...manualInstallments];
    updated[index] = { ...updated[index], amount: newAmount };
    form.setValue('manual_installments', updated);
  };

  const calculateTotal = () => {
    return manualInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const currentTotal = calculateTotal();
  const difference = currentTotal - amount;
  const hasInterest = difference > 0.01;
  const interestPercentage = amount > 0 ? (difference / amount) * 100 : 0;

  const onSubmit = (data: PurchaseFormData) => {
    console.log('Submitting purchase form:', data);
    
    const submitData = {
      ...data,
      manual_installments: manualInstallments.length > 0 ? manualInstallments : undefined,
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

            {/* Valores das parcelas */}
            {installments > 0 && amount > 0 && (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-sm mb-3">Valores das Parcelas</h4>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {manualInstallments.map((installment, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <label className="text-xs w-12 flex-shrink-0 text-gray-600">
                          {installment.installment_number}ª:
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={installment.amount || ''}
                          onChange={(e) => handleInstallmentChange(index, e.target.value)}
                          className="text-sm h-8"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo dos valores */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor da compra:</span>
                    <span className="font-medium">R$ {amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total das parcelas:</span>
                    <span className="font-medium">R$ {currentTotal.toFixed(2)}</span>
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
