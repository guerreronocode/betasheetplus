
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  onChange: (v: string) => void;
};
const InvestmentAmountField: React.FC<Props> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="amount">Valor Investido</Label>
    <Input
      id="amount"
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
    />
  </div>
);
export default InvestmentAmountField;
