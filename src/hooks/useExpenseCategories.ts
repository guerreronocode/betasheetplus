
import { useIntegratedCategories } from './useIntegratedCategories';

// Re-export do hook integrado para manter compatibilidade
export const useExpenseCategories = () => {
  return useIntegratedCategories();
};
