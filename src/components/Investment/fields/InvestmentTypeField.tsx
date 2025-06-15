
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const types = [
  "stocks", "bonds", "crypto", "real-estate", "funds", "savings", "CDB", "ETFs", "Debêntures",
  "Tesouro Direto", "LCI", "LCA", "Previdência Privada", "COE", "FIIs", "Commodities", "Cashback",
  "Crowdfunding", "Offshore", "other"
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}
const InvestmentTypeField: React.FC<Props> = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">Tipo</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o tipo" />
      </SelectTrigger>
      <SelectContent>
        {types.map(t => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default InvestmentTypeField;
