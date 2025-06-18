
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { billPaymentSchema, BillPaymentFormData } from '@/types/creditCard';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { formatCurrency } from '@/utils/formatters';
import { CreditCardBill } from '@/types/creditCard';

interface BillPaymentDialogProps {
  bill: CreditCardBill | null;
  isOpen: boolean;
  onClose: () => void;
  onPayBill: (billId: string, paymentData: BillPaymentFormData) => void;
  isPaying: boolean;
}

export const BillPaymentDialog: React.FC<BillPaymentDialogProps> = ({
  bill,
  isOpen,
  onClose,
  onPayBill,
  isPaying
}) => {
  const { bankAccounts } = useBankAccounts();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BillPaymentFormData>({
    resolver: zodResolver(billPaymentSchema)
  });

  const onSubmit = (data: BillPaymentFormData) => {
    if (bill) {
      onPayBill(bill.id, data);
      reset();
      onClose();
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar Fatura como Paga</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">
              {bill.credit_cards?.name || 'Cartão'}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(bill.total_amount)}
            </p>
            <p className="text-sm text-blue-700">
              Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Pagamento
              </label>
              <input
                type="date"
                {...register('paid_date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              {errors.paid_date && (
                <p className="text-red-500 text-sm mt-1">{errors.paid_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta de Débito
              </label>
              <select
                {...register('paid_account_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a conta...</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bank_name}
                  </option>
                ))}
              </select>
              {errors.paid_account_id && (
                <p className="text-red-500 text-sm mt-1">{errors.paid_account_id.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isPaying}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPaying}
              >
                {isPaying ? 'Processando...' : 'Marcar como Paga'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
