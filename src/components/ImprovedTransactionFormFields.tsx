import React from 'react';
import HierarchicalCategorySelector from './shared/HierarchicalCategorySelector';

interface TransactionFormFieldsProps {
  type: 'income' | 'expense';
  form: any;
  handleChange: (partial: any) => void;
}

const ImprovedTransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
  type,
  form,
  handleChange
}) => {
  return (
    <HierarchicalCategorySelector
      value={form.category}
      onChange={(value) => handleChange({ category: value })}
      categoryType={type}
      placeholder={`Escolha uma categoria de ${type === 'expense' ? 'despesa' : 'receita'}`}
      required
    />
  );
};

export default ImprovedTransactionFormFields;