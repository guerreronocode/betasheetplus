
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryOption {
  value: string;
  label: string;
}
interface CategorySelectorProps {
  value: string;
  options: CategoryOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, options, onChange, placeholder, required }) => (
  <Select value={value} onValueChange={onChange} required={required}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder || "Escolha uma categoria"} />
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default CategorySelector;
