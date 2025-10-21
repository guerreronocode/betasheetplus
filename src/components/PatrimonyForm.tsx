
import React from "react";
import { Button } from "@/components/ui/button";
import { PatrimonyFormFields } from "./PatrimonyFormFields";
import { validatePatrimonyForm } from "./usePatrimonyFormValidation";

interface PatrimonyFormProps {
  form: any;
  entryType: "asset" | "liability";
  onChange: (value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit?: () => void;
  isSaving?: boolean;
  investments: any[];
  bankAccounts: any[];
  debts?: any[];
  onEntryTypeChange?: (type: "asset" | "liability") => void;
}

const PatrimonyForm: React.FC<PatrimonyFormProps> = ({
  form,
  entryType,
  onChange,
  onSubmit,
  onCancelEdit,
  isSaving,
  investments,
  bankAccounts,
  debts = [],
  onEntryTypeChange,
}) => {
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Novo método de validação usando hook separado
  const validateBeforeSubmit = (e: React.FormEvent) => {
    setLocalError(null);
    const error = validatePatrimonyForm({
      form,
      entryType,
      investments,
      bankAccounts,
      debts,
      isSaving,
    });
    if (error) {
      e.preventDefault();
      setLocalError(error);
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={validateBeforeSubmit} className="space-y-2 border rounded p-4 mt-2 bg-gray-50">
      {form.isEdit && onCancelEdit && (
        <Button type="button" variant="secondary" className="mb-3" onClick={onCancelEdit}>
          Cancelar edição
        </Button>
      )}
      {(localError) && (
        <div className="bg-red-100 text-red-600 border-l-4 border-red-400 p-2 text-xs rounded">
          {localError}
        </div>
      )}
      <PatrimonyFormFields
        entryType={entryType}
        form={form}
        onChange={onChange}
        investments={investments}
        bankAccounts={bankAccounts}
        debts={debts}
      />
      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? "Salvando..." : (form.isEdit ? "Salvar alterações" : "Adicionar")}
      </Button>
    </form>
  );
};

export default PatrimonyForm;
