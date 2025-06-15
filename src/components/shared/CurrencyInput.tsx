
import React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, placeholder, required }) => (
  <Input
    type="number"
    min={0}
    step="0.01"
    value={value}
    onChange={onChange}
    placeholder={placeholder || "0,00"}
    required={required}
  />
);

export default CurrencyInput;
