import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTransactionModal = ({ open, onOpenChange }: AddTransactionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base">Adicionar Transação</DialogTitle>
        </DialogHeader>
        <div className="[&_.fnb-card]:p-3 [&_label]:text-xs [&_input]:h-7 [&_button]:h-7 [&_.space-y-4]:space-y-3 [&_.space-y-3]:space-y-3 space-y-4">
          <UnifiedTransactionForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;