
import { assetCategoryOptions, liabilityCategoryOptions } from "./patrimonyCategories";

type EntryType = "asset" | "liability";

interface ValidationParams {
  form: any;
  entryType: EntryType;
  investments: any[];
  bankAccounts: any[];
  isSaving?: boolean;
}

export function validatePatrimonyForm({
  form,
  entryType,
  investments,
  bankAccounts,
  isSaving,
}: ValidationParams): string | null {
  if (isSaving) {
    return "Por favor, aguarde o salvamento ser concluído.";
  }
  if (entryType === "asset" && (form.linkType === "manual" || !form.linkType)) {
    if (!form.name?.trim()) {
      return "Você precisa informar o nome do ativo.";
    }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
      return "Informe um valor positivo e maior que zero.";
    }
    if (!form.category?.trim()) {
      return "Escolha uma categoria para o ativo.";
    }
  }
  if (entryType === "asset" && form.linkType === "investment" && !form.linkedInvestmentId) {
    return "Escolha um investimento válido.";
  }
  if (entryType === "asset" && form.linkType === "bank" && !form.linkedBankAccountId) {
    return "Escolha uma conta bancária válida.";
  }
  if (entryType === "liability") {
    if (!form.name?.trim()) {
      return "Você precisa informar o nome do passivo.";
    }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
      return "Informe um valor positivo e maior que zero.";
    }
    if (!form.category?.trim()) {
      return "Escolha uma categoria para o passivo.";
    }
  }
  return null;
}
