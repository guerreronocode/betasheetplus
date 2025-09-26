import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TransferBetweenAccounts from '@/components/TransferBetweenAccounts';

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransferModal = ({ open, onOpenChange }: TransferModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Transferência entre Contas</DialogTitle>
        </DialogHeader>
        <div className="[&_label]:text-xs [&_input]:h-8 [&_button]:h-8 [&_.space-y-4]:space-y-3">
          <TransferBetweenAccounts />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;