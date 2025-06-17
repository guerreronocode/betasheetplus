
import React, { useState } from "react";
import PatrimonyForm from "./PatrimonyForm";
import { PatrimonyFormFactory, PatrimonyFormData } from "@/services/patrimonyService";
import { usePatrimonyFormHandler } from "@/modules/patrimony/components/PatrimonyFormHandler";

interface PatrimonyFormContainerProps {
  entryType: "asset" | "liability";
  setEntryType: (val: "asset" | "liability") => void;
  onResetForm: () => void;
  selectedGroup: string | null;
  patrimonyCategoryRules: Record<string, string>;
  form: PatrimonyFormData;
  setForm: (f: PatrimonyFormData) => void;
  investments: any[];
  bankAccounts: any[];
  isAddingAsset: boolean;
  isAddingLiability: boolean;
  addAsset: any;
  updateAsset: any;
  deleteAsset: any;
  addLiability: any;
  updateLiability: any;
  deleteLiability: any;
}

const PatrimonyFormContainer: React.FC<PatrimonyFormContainerProps> = ({
  entryType,
  setEntryType,
  onResetForm,
  selectedGroup,
  patrimonyCategoryRules,
  form,
  setForm,
  investments,
  bankAccounts,
  isAddingAsset,
  isAddingLiability,
  addAsset,
  updateAsset,
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability,
}) => {
  // Handler para alternar tipo de entrada corretamente
  const handleTypeChange = (type: "asset" | "liability") => {
    setEntryType(type);
    if (type === "liability") {
      setForm(PatrimonyFormFactory.createEmptyLiabilityForm());
    } else {
      setForm(PatrimonyFormFactory.createEmptyAssetForm());
    }
  };

  const { handleSubmit, formError, setFormError } = usePatrimonyFormHandler({
    form,
    entryType,
    investments,
    bankAccounts,
    onSuccess: onResetForm,
    addAsset,
    updateAsset,
    addLiability,
    updateLiability,
  });

  return (
    <div className="max-w-xl">
      {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
      <PatrimonyForm
        form={form}
        entryType={entryType}
        onChange={(val) => {
          setFormError(null);
          setForm(val);
        }}
        onSubmit={handleSubmit}
        onCancelEdit={onResetForm}
        isSaving={isAddingAsset || isAddingLiability}
        investments={investments}
        bankAccounts={bankAccounts}
        onEntryTypeChange={handleTypeChange}
      />
    </div>
  );
};

export default PatrimonyFormContainer;
