import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreditCard as CreditCardType } from '@/types/creditCard';

interface DeleteCreditCardDialogProps {
  card: CreditCardType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteCreditCardDialog: React.FC<DeleteCreditCardDialogProps> = ({
  card,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!card) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Excluir Cartão de Crédito
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o cartão <strong>"{card.name}"</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita e removerá:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>Todas as faturas associadas ao cartão</li>
              <li>Todas as compras e parcelas registradas</li>
              <li>Histórico de transações relacionadas</li>
            </ul>
            <p className="text-sm font-medium text-orange-600">
              Recomendamos que você verifique se não há faturas pendentes antes de prosseguir.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Excluindo...' : 'Sim, Excluir Cartão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};