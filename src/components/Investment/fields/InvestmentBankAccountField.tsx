
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
type BankAccount = { id: string; name: string; bank_name: string; color?: string; };

interface Props {
  value: string;
  accounts: BankAccount[];
  onChange: (v: string) => void;
}
const InvestmentBankAccountField: React.FC<Props> = ({ value, accounts, onChange }) => (
  <div>
    <Label htmlFor="bank_account_id">Conta Bancária</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma conta (opcional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhuma conta específica</SelectItem>
        {accounts.map(acc => (
          <SelectItem key={acc.id} value={acc.id}>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
              {acc.name} - {acc.bank_name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
export default InvestmentBankAccountField;
