
import { PatrimonyValidationService, PatrimonyFormData } from "@/services/patrimonyService";

interface ValidationParams {
  form: PatrimonyFormData;
  entryType: "asset" | "liability";
  investments: any[];
  bankAccounts: any[];
  debts?: any[];
  isSaving?: boolean;
}

export const validatePatrimonyForm = ({
  form,
  entryType,
  investments,
  bankAccounts,
  debts = [],
  isSaving,
}: ValidationParams): string | null => {
  if (isSaving) {
    return "Salvando... aguarde.";
  }

  if (entryType === "liability") {
    return PatrimonyValidationService.validateLiabilityForm(form, debts);
  } else {
    return PatrimonyValidationService.validateAssetForm(form, investments, bankAccounts);
  }
};
