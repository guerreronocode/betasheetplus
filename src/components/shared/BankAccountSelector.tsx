
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  balance: number;
}

interface BankAccountSelectorProps {
  value: string;
  accounts: BankAccount[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({ value, accounts, onChange, placeholder, required }) => (
  <Select value={value} onValueChange={onChange} required={required}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder || "Escolha uma conta bancária"} />
    </SelectTrigger>
    <SelectContent>
      {accounts.map(acc => (
        <SelectItem key={acc.id} value={acc.id}>
          {acc.name} - {acc.bank_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default BankAccountSelector;
