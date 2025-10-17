import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatrimonyFormContainer from '../PatrimonyFormContainer';
import { PatrimonyFormData } from '@/services/patrimonyService';

interface LiabilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PatrimonyFormData;
  setForm: (f: PatrimonyFormData) => void;
  onResetForm: () => void;
  patrimonyCategoryRules: Record<string, string>;
  investments: any[];
  bankAccounts: any[];
  debts: any[];
  isAddingLiability: boolean;
  addLiability: any;
  updateLiability: any;
  deleteLiability: any;
}

export const LiabilityFormDialog: React.FC<LiabilityFormDialogProps> = ({
  open,
  onOpenChange,
  form,
  setForm,
  onResetForm,
  patrimonyCategoryRules,
  investments,
  bankAccounts,
  debts,
  isAddingLiability,
  addLiability,
  updateLiability,
  deleteLiability,
}) => {
  const handleClose = () => {
    onOpenChange(false);
    onResetForm();
  };

  const handleResetFormWithClose = () => {
    onResetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {form.isEdit ? 'Editar Passivo' : 'Adicionar Passivo'}
          </DialogTitle>
        </DialogHeader>
        <PatrimonyFormContainer
          entryType="liability"
          setEntryType={() => {}}
          onResetForm={handleResetFormWithClose}
          selectedGroup={null}
          patrimonyCategoryRules={patrimonyCategoryRules}
          form={form}
          setForm={setForm}
          investments={investments}
          bankAccounts={bankAccounts}
          debts={debts}
          isAddingAsset={false}
          isAddingLiability={isAddingLiability}
          addAsset={() => {}}
          updateAsset={() => {}}
          deleteAsset={() => {}}
          addLiability={addLiability}
          updateLiability={updateLiability}
          deleteLiability={deleteLiability}
        />
      </DialogContent>
    </Dialog>
  );
};
