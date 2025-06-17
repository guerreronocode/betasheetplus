
import { PatrimonyValidationService, PatrimonyFormData } from "@/services/patrimonyService";

interface ValidationParams {
  form: PatrimonyFormData;
  entryType: "asset" | "liability";
  investments: any[];
  bankAccounts: any[];
  isSaving?: boolean;
}

export const validatePatrimonyForm = ({
  form,
  entryType,
  investments,
  bankAccounts,
  isSaving,
}: ValidationParams): string | null => {
  if (isSaving) {
    return "Salvando... aguarde.";
  }

  if (entryType === "liability") {
    return PatrimonyValidationService.validateLiabilityForm(form);
  } else {
    return PatrimonyValidationService.validateAssetForm(form, investments, bankAccounts);
  }
};
