
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  
  const [autoFillInstallments, setAutoFillInstallments] = useState(true);
  const [installmentValues, setInstallmentValues] = useState<number[]>([]);

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

  // Atualizar valores das parcelas quando mudar número de parcelas ou valor total
  React.useEffect(() => {
    if (installments > 0 && amount > 0) {
      if (autoFillInstallments) {
        const equalValue = amount / installments;
        setInstallmentValues(Array(installments).fill(Number(equalValue.toFixed(2))));
      } else {
        // Manter valores existentes ou preencher com zeros
        const newValues = Array(installments).fill(0).map((_, index) => 
          installmentValues[index] || 0
        );
        setInstallmentValues(newValues);
      }
    }
  }, [installments, amount, autoFillInstallments]);

  const handleInstallmentValueChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newValues = [...installmentValues];
    newValues[index] = numValue;
    setInstallmentValues(newValues);
  };

  const handleAutoFillToggle = (enabled: boolean) => {
    setAutoFillInstallments(enabled);
    if (enabled && amount > 0 && installments > 0) {
      const equalValue = amount / installments;
      setInstallmentValues(Array(installments).fill(Number(equalValue.toFixed(2))));
    }
  };

  const calculateTotal = () => {
    return installmentValues.reduce((sum, value) => sum + value, 0);
  };

  const isFormValid = () => {
    if (installments <= 1) return true;
    
    const total = calculateTotal();
    const difference = Math.abs(total - amount);
    return difference < 0.01; // Tolerância para arredondamentos
  };

  const onSubmit = (data: PurchaseFormData) => {
    console.log('Submitting purchase form:', data);
    
    // Se temos parcelas com valores manuais, criar manual_installments
    let manualInstallments: ManualInstallmentData[] = [];
    
    if (installments > 1 && installmentValues.length === installments) {
      manualInstallments = installmentValues.map((amount, index) => ({
        installment_number: index + 1,
        amount: amount
      }));
    }
    
    const submitData = {
      ...data,
      manual_installments: manualInstallments.length > 0 ? manualInstallments : undefined,
    };
    
    console.log('Final submit data:', submitData);
    createPurchase(submitData);
    onClose();
  };

  const currentTotal = calculateTotal();
  const difference = Math.abs(currentTotal - amount);
  const totalMatches = difference < 0.01;

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

            {/* Seção de Valores das Parcelas */}
            {installments > 1 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-fill"
                    checked={autoFillInstallments}
                    onCheckedChange={handleAutoFillToggle}
                  />
                  <Label htmlFor="auto-fill" className="text-sm font-medium">
                    Adicionar valores das parcelas automaticamente
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Valor das Parcelas</Label>
                  
                  {installmentValues.map((value, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Label className="text-sm w-16 flex-shrink-0">
                        {index + 1}ª parcela:
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={value || ''}
                        onChange={(e) => handleInstallmentValueChange(index, e.target.value)}
                        disabled={autoFillInstallments}
                        className="flex-1"
                        placeholder="0.00"
                      />
                    </div>
                  ))}

                  {/* Resumo dos valores */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total das parcelas:</span>
                      <span className={!totalMatches ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        R$ {currentTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor da compra:</span>
                      <span className="font-medium">R$ {amount.toFixed(2)}</span>
                    </div>
                    
                    {!totalMatches && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        ⚠️ A soma das parcelas deve ser igual ao valor total da compra.
                        <br />
                        Diferença: R$ {difference.toFixed(2)}
                      </div>
                    )}
                    
                    {totalMatches && installmentValues.length > 0 && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        ✅ Valores conferem! As parcelas somam o valor total da compra.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isCreating || !isFormValid()}
              >
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
