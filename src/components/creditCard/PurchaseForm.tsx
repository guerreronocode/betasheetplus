
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
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { ManualInstallmentsEditor } from './ManualInstallmentsEditor';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { purchaseSchema, PurchaseFormData, ManualInstallmentData } from '@/types/creditCard';

interface PurchaseFormProps {
  onClose: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose }) => {
  const { creditCards } = useCreditCards();
  const { createPurchase, isCreating } = useCreditCardPurchases();
  const { categories } = useExpenseCategories();
  
  const [isManualInstallments, setIsManualInstallments] = useState(false);
  const [manualInstallments, setManualInstallments] = useState<ManualInstallmentData[]>([]);

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

  const selectedCardId = form.watch('credit_card_id');
  const amount = form.watch('amount');
  const installments = form.watch('installments');

  const installmentValue = amount && installments && !isManualInstallments ? amount / installments : 0;

  const onSubmit = (data: PurchaseFormData) => {
    console.log('Submitting purchase form:', data);
    const submitData = {
      ...data,
      manual_installments: isManualInstallments ? manualInstallments : undefined,
    };
    createPurchase(submitData);
    onClose();
  };

  const handleManualInstallmentsChange = (installments: ManualInstallmentData[]) => {
    setManualInstallments(installments);
    form.setValue('manual_installments', installments);
  };

  const handleToggleManual = (enabled: boolean) => {
    setIsManualInstallments(enabled);
    if (!enabled) {
      setManualInstallments([]);
      form.setValue('manual_installments', []);
    }
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
                  <FormLabel>Descrição</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
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
                    <FormLabel>Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        placeholder="1"
                        {...field}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          // Reset manual installments when changing number of installments
                          if (isManualInstallments) {
                            setManualInstallments([]);
                            form.setValue('manual_installments', []);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {amount > 0 && installments > 1 && (
              <ManualInstallmentsEditor
                totalAmount={amount}
                installments={installments}
                manualInstallments={manualInstallments}
                onManualInstallmentsChange={handleManualInstallmentsChange}
                onToggleManual={handleToggleManual}
                isManualEnabled={isManualInstallments}
              />
            )}

            {!isManualInstallments && installmentValue > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Valor por parcela:</span>{' '}
                  R$ {installmentValue.toFixed(2)}
                </p>
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
