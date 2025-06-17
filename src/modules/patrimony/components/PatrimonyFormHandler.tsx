
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  PatrimonyValidationService, 
  PatrimonyDataService, 
  PatrimonyTransformService,
  PatrimonyFormData 
} from "@/services/patrimonyService";

interface PatrimonyFormHandlerProps {
  form: PatrimonyFormData;
  entryType: "asset" | "liability";
  investments: any[];
  bankAccounts: any[];
  onSuccess: () => void;
  addAsset: (data: any) => void;
  updateAsset: (data: any) => void;
  addLiability: (data: any) => void;
  updateLiability: (data: any) => void;
}

export const usePatrimonyFormHandler = ({
  form,
  entryType,
  investments,
  bankAccounts,
  onSuccess,
  addAsset,
  updateAsset,
  addLiability,
  updateLiability,
}: PatrimonyFormHandlerProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError("Usuário não autenticado.");
      return;
    }

    try {
      if (entryType === "liability") {
        const validationError = PatrimonyValidationService.validateLiabilityForm(form);
        if (validationError) {
          setFormError(validationError);
          return;
        }

        const liabilityData = PatrimonyTransformService.formToLiabilityData(form);
        
        if (form.isEdit && form.id) {
          updateLiability({ id: form.id, ...liabilityData });
        } else {
          addLiability(liabilityData);
        }
      } else {
        const validationError = PatrimonyValidationService.validateAssetForm(form, investments, bankAccounts);
        if (validationError) {
          setFormError(validationError);
          return;
        }

        const assetData = PatrimonyTransformService.formToAssetData(form, investments, bankAccounts);
        
        if (form.isEdit && form.id) {
          updateAsset({ id: form.id, ...assetData });
        } else {
          addAsset(assetData);
        }
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      setFormError("Erro interno. Tente novamente.");
    }
  };

  return {
    handleSubmit,
    formError,
    setFormError,
  };
};
