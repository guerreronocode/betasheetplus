import React from 'react';
import { PlannedExpenseForm } from './PlannedExpenseForm';

interface PlannedExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlannedExpenseFormModal: React.FC<PlannedExpenseFormModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return <PlannedExpenseForm open={open} onOpenChange={onOpenChange} />;
};
