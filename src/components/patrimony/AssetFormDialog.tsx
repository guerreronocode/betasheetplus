import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PatrimonyFormContainer from '../PatrimonyFormContainer';
import { PatrimonyFormData } from '@/services/patrimonyService';

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PatrimonyFormData;
  setForm: (f: PatrimonyFormData) => void;
  onResetForm: () => void;
  patrimonyCategoryRules: Record<string, string>;
  investments: any[];
  bankAccounts: any[];
  debts: any[];
  isAddingAsset: boolean;
  addAsset: any;
  updateAsset: any;
  deleteAsset: any;
}

export const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  open,
  onOpenChange,
  form,
  setForm,
  onResetForm,
  patrimonyCategoryRules,
  investments,
  bankAccounts,
  debts,
  isAddingAsset,
  addAsset,
  updateAsset,
  deleteAsset,
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
            {form.isEdit ? 'Editar Ativo' : 'Adicionar Ativo'}
          </DialogTitle>
        </DialogHeader>
        <PatrimonyFormContainer
          entryType="asset"
          setEntryType={() => {}}
          onResetForm={handleResetFormWithClose}
          selectedGroup={null}
          patrimonyCategoryRules={patrimonyCategoryRules}
          form={form}
          setForm={setForm}
          investments={investments}
          bankAccounts={bankAccounts}
          debts={debts}
          isAddingAsset={isAddingAsset}
          isAddingLiability={false}
          addAsset={addAsset}
          updateAsset={updateAsset}
          deleteAsset={deleteAsset}
          addLiability={() => {}}
          updateLiability={() => {}}
          deleteLiability={() => {}}
        />
      </DialogContent>
    </Dialog>
  );
};
