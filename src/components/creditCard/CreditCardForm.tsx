
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreditCards } from '@/hooks/useCreditCards';
import { X } from 'lucide-react';

const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  credit_limit: z.number().min(0, 'Limite deve ser positivo'),
  closing_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  due_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  onClose: () => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ onClose }) => {
  const { createCreditCard, isCreating } = useCreditCards();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      credit_limit: 0,
      closing_day: 1,
      due_day: 1,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: CreditCardFormData) => {
    console.log('Submitting credit card form:', data);
    // Ensure all required fields are present before calling the hook
    const validatedData: CreditCardFormData = {
      name: data.name || '',
      credit_limit: data.credit_limit || 0,
      closing_day: data.closing_day || 1,
      due_day: data.due_day || 1,
    };
    createCreditCard(validatedData);
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Novo Cartão de Crédito</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Nubank, Santander, etc."
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="credit_limit">Limite de Crédito</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              {...register('credit_limit', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.credit_limit && (
              <p className="text-sm text-destructive mt-1">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closing_day">Dia de Fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                {...register('closing_day', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.closing_day && (
                <p className="text-sm text-destructive mt-1">{errors.closing_day.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="due_day">Dia de Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                {...register('due_day', { valueAsNumber: true })}
                placeholder="15"
              />
              {errors.due_day && (
                <p className="text-sm text-destructive mt-1">{errors.due_day.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Cartão'}
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
