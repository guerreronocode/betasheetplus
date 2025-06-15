
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  "Ações", "Títulos", "Criptomoedas", "Poupança", "CDB", "Fundos", "Imóveis", "ETFs", "Debêntures",
  "BDRs", "Tesouro Direto", "LCI", "LCA", "Previdência Privada", "COE", "FIIs", "Commodities",
  "Cashback", "Crowdfunding", "Offshore", "Outros"
];

type Props = {
  value: string;
  isEmergency: boolean;
  onCategoryChange: (v: string) => void;
  onEmergencyChange: (v: boolean) => void;
};
const InvestmentCategoryField: React.FC<Props> = ({ value, isEmergency, onCategoryChange, onEmergencyChange }) => (
  <div>
    <Label htmlFor="category">Categoria</Label>
    <Select value={value} onValueChange={onCategoryChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories.map(c => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <div className="flex items-center gap-3 mt-2">
      <Switch
        id="reserva_emergencia"
        checked={isEmergency}
        onCheckedChange={onEmergencyChange}
      />
      <Label htmlFor="reserva_emergencia" className="cursor-pointer">
        Parte da <span className="font-bold text-blue-600">reserva de emergência</span>
      </Label>
    </div>
  </div>
);
export default InvestmentCategoryField;
