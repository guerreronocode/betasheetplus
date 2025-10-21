import React from 'react';
import { RecurringIncomeForm } from './RecurringIncomeForm';

interface PlannedIncomeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlannedIncomeFormModal: React.FC<PlannedIncomeFormModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return <RecurringIncomeForm open={open} onOpenChange={onOpenChange} />;
};
