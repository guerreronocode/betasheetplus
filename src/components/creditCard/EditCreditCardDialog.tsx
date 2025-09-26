
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { creditCardSchema, CreditCardFormData, CreditCard } from '@/types/creditCard';
import { useCreditCards } from '@/hooks/useCreditCards';

interface EditCreditCardDialogProps {
  card: CreditCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCreditCardDialog: React.FC<EditCreditCardDialogProps> = ({
  card,
  isOpen,
  onClose,
}) => {
  const { updateCreditCard, isUpdating } = useCreditCards();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    values: card ? {
      name: card.name,
      credit_limit: card.credit_limit,
      closing_day: card.closing_day,
      due_day: card.due_day,
    } : undefined,
  });

  const onSubmit = (data: CreditCardFormData) => {
    if (!card) return;
    
    updateCreditCard({ 
      id: card.id, 
      ...data,
      updated_at: new Date().toISOString()
    });
    onClose();
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cartão de Crédito</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome do Cartão</Label>
            <Input
              id="edit-name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-credit_limit">Limite de Crédito</Label>
            <Input
              id="edit-credit_limit"
              type="number"
              step="0.01"
              {...register('credit_limit', { valueAsNumber: true })}
            />
            {errors.credit_limit && (
              <p className="text-red-500 text-sm mt-1">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-closing_day">Dia do Fechamento</Label>
              <Input
                id="edit-closing_day"
                type="number"
                min="1"
                max="31"
                {...register('closing_day', { valueAsNumber: true })}
              />
              {errors.closing_day && (
                <p className="text-red-500 text-sm mt-1">{errors.closing_day.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-due_day">Dia do Vencimento</Label>
              <Input
                id="edit-due_day"
                type="number"
                min="1"
                max="31"
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-red-500 text-sm mt-1">{errors.due_day.message}</p>
              )}
            </div>
          </div>


          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
