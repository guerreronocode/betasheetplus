import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { creditCardSchema, CreditCardFormData } from '@/types/creditCard';
import { useCreditCards } from '@/hooks/useCreditCards';

interface CreditCardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { createCreditCard, isCreating } = useCreditCards();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      include_in_patrimony: false
    }
  });

  const includeInPatrimony = watch('include_in_patrimony');

  const onSubmit = (data: CreditCardFormData) => {
    createCreditCard(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cartão de Crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs font-medium">Nome do Cartão</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Cartão Principal"
              className="h-8 text-sm"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="credit_limit" className="text-xs font-medium">Limite de Crédito</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              placeholder="0,00"
              className="h-8 text-sm"
              {...register('credit_limit', { valueAsNumber: true })}
            />
            {errors.credit_limit && (
              <p className="text-red-500 text-xs mt-1">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="closing_day" className="text-xs font-medium">Dia do Fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                className="h-8 text-sm"
                {...register('closing_day', { valueAsNumber: true })}
              />
              {errors.closing_day && (
                <p className="text-red-500 text-xs mt-1">{errors.closing_day.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="due_day" className="text-xs font-medium">Dia do Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                className="h-8 text-sm"
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-red-500 text-xs mt-1">{errors.due_day.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include_in_patrimony"
              checked={includeInPatrimony}
              onCheckedChange={(checked) => setValue('include_in_patrimony', checked as boolean)}
            />
            <Label htmlFor="include_in_patrimony" className="text-xs font-normal">
              Incluir no cálculo do patrimônio
            </Label>
          </div>
          {includeInPatrimony && (
            <p className="text-xs text-muted-foreground ml-6">
              O limite disponível será considerado como ativo no seu patrimônio líquido.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-8 text-sm"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-8 text-sm" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Cartão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};