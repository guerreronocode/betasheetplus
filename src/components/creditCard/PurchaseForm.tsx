import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardPurchases } from '@/hooks/useCreditCardPurchases';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const purchaseSchema = z.object({
  credit_card_id: z.string().min(1, 'Selecione um cartão'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  purchase_date: z.string().min(1, 'Data é obrigatória'),
  installments: z.number().min(1, 'Parcelas deve ser ao menos 1').max(36, 'Máximo 36 parcelas'),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  onClose: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose }) => {
  const { creditCards } = useCreditCards();
  const { createPurchase, isCreating } = useCreditCardPurchases();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      credit_card_id: '',
      description: '',
      amount: 0,
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      installments: 1,
    },
  });

  const selectedCardId = watch('credit_card_id');
  const amount = watch('amount');
  const installments = watch('installments');

  const installmentValue = amount && installments ? amount / installments : 0;

  const onSubmit = (data: PurchaseFormData) => {
    console.log('Submitting purchase form:', data);
    // Force data to match the exact form type
    createPurchase(data as PurchaseFormData);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="credit_card_id">Cartão de Crédito</Label>
            <Select onValueChange={(value) => setValue('credit_card_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.credit_card_id && (
              <p className="text-sm text-destructive mt-1">{errors.credit_card_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Ex: Compra no supermercado"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor Total</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                max="36"
                {...register('installments', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.installments && (
                <p className="text-sm text-destructive mt-1">{errors.installments.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="purchase_date">Data da Compra</Label>
            <Input
              id="purchase_date"
              type="date"
              {...register('purchase_date')}
            />
            {errors.purchase_date && (
              <p className="text-sm text-destructive mt-1">{errors.purchase_date.message}</p>
            )}
          </div>

          {installmentValue > 0 && (
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
      </CardContent>
    </Card>
  );
};
