
import React from "react";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, required }) => (
  <Input type="date" value={value} onChange={onChange} required={required} />
);

export default DateInput;
