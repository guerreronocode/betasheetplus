
import React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  required,
  min = 0,
  max = 999999999.99
}) => (
  <Input
    type="number"
    min={min}
    max={max}
    step="0.01"
    value={value}
    onChange={onChange}
    placeholder={placeholder || "0,00"}
    required={required}
  />
);

export default CurrencyInput;
