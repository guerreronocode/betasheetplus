
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  onChange: (date: string) => void;
};
const InvestmentDateField: React.FC<Props> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="purchase_date">Data da Compra</Label>
    <Input
      id="purchase_date"
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
    />
  </div>
);
export default InvestmentDateField;
