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
    <div className="[&_.h-8]:h-8">
      <HierarchicalCategorySelector
        value={form.category}
        onChange={(value) => handleChange({ category: value })}
        placeholder={`Escolha uma categoria de ${type === 'expense' ? 'despesa' : 'receita'}`}
        categoryType={type === 'expense' ? 'expense' : 'income'}
        required
      />
    </div>
  );
};

export default ImprovedTransactionFormFields;