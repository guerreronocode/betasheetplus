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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Adicionar Transação</DialogTitle>
        </DialogHeader>
        <div className="[&_.fnb-card]:p-4 [&_label]:text-xs [&_input]:h-8 [&_button]:h-8 [&_.space-y-4]:space-y-3">
          <UnifiedTransactionForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;