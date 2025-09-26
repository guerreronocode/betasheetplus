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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transferência entre Contas</DialogTitle>
        </DialogHeader>
        <TransferBetweenAccounts />
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;