
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { creditCardSchema, CreditCardFormData } from '@/types/creditCard';
import { useCreditCards } from '@/hooks/useCreditCards';
import { CreditCard } from 'lucide-react';

export const CreditCardForm: React.FC = () => {
  const { createCreditCard, isCreating } = useCreditCards();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema)
  });

  const onSubmit = (data: CreditCardFormData) => {
    createCreditCard(data);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Novo Cartão de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Cartão Principal"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="credit_limit">Limite de Crédito</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register('credit_limit', { valueAsNumber: true })}
            />
            {errors.credit_limit && (
              <p className="text-red-500 text-sm mt-1">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closing_day">Dia do Fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                {...register('closing_day', { valueAsNumber: true })}
              />
              {errors.closing_day && (
                <p className="text-red-500 text-sm mt-1">{errors.closing_day.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="due_day">Dia do Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-red-500 text-sm mt-1">{errors.due_day.message}</p>
              )}
            </div>
          </div>


          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? 'Criando...' : 'Criar Cartão'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
