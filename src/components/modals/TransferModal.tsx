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
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base">Transferência entre Contas</DialogTitle>
        </DialogHeader>
        <div className="[&_label]:text-xs [&_input]:h-7 [&_button]:h-7 [&_.space-y-4]:space-y-2 [&_.space-y-3]:space-y-2">
          <TransferBetweenAccounts />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;