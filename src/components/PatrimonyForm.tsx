
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
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={entryType === "asset" ? "default" : "outline"}
          onClick={() => onChange({ ...form, entryType: "asset" })}
        >
          Ativo
        </Button>
        <Button
          type="button"
          variant={entryType === "liability" ? "default" : "outline"}
          onClick={() => onChange({ ...form, entryType: "liability" })}
        >
          Passivo
        </Button>
        {form.isEdit && onCancelEdit && (
          <Button type="button" variant="secondary" className="ml-2" onClick={onCancelEdit}>
            Cancelar edição
          </Button>
        )}
      </div>
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
      />
      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? "Salvando..." : (form.isEdit ? "Salvar alterações" : "Adicionar")}
      </Button>
    </form>
  );
};

export default PatrimonyForm;
