
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type YieldEntry = { rate_type: string; rate_value: number; };
const yieldTypes = [
  { value: "fixed", label: "Taxa Fixa" },
  { value: "cdi", label: "CDI" },
  { value: "cdi_plus", label: "CDI + X%" },
  { value: "selic", label: "SELIC" },
  { value: "selic_plus", label: "SELIC + X%" },
  { value: "ipca", label: "IPCA" },
  { value: "ipca_plus", label: "IPCA + X%" }
];
type Props = {
  yield_type: string;
  yield_rate: string;
  yield_extra?: string;
  yield_percent_index?: string;
  onYieldTypeChange: (v: string) => void;
  onYieldRateChange: (v: string) => void;
  onYieldExtraChange: (v: string) => void;
  onYieldPercentIndexChange: (v: string) => void;
};

const InvestmentYieldField: React.FC<Props> = ({
  yield_type,
  yield_rate,
  yield_extra,
  yield_percent_index,
  onYieldTypeChange,
  onYieldRateChange,
  onYieldExtraChange,
  onYieldPercentIndexChange
}) => (
  <div>
    <Label htmlFor="yield_type">Tipo de Rendimento</Label>
    <Select value={yield_type} onValueChange={onYieldTypeChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o tipo de rendimento" />
      </SelectTrigger>
      <SelectContent>
        {yieldTypes.map(yt => (
          <SelectItem key={yt.value} value={yt.value}>{yt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {/* Para tipos _plus, permite extra */}
    {yield_type && yield_type.endsWith("_plus") && (
      <div className="mt-2">
        <Label htmlFor="yield_extra">Adicional (%)</Label>
        <Input
          id="yield_extra"
          type="number"
          step="0.01"
          min="0"
          value={yield_extra || ""}
          placeholder="0.00"
          onChange={e => onYieldExtraChange(e.target.value)}
          required
        />
      </div>
    )}
    {/* Percentual do índice para CDI, SELIC, IPCA */}
    {["cdi", "selic", "ipca"].includes(yield_type) && (
      <div className="mt-2">
        <Label htmlFor="yield_percent_index">Percentual do índice (%)</Label>
        <Input
          id="yield_percent_index"
          type="number"
          step="0.01"
          min="0"
          max="200"
          value={yield_percent_index || ""}
          placeholder="Ex: 99 para 99% do índice"
          onChange={e => onYieldPercentIndexChange(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Exemplo: 103 para 103% do índice. Deixe em branco para 100%.
        </p>
      </div>
    )}
    {/* Valor direto para taxa fixa */}
    {yield_type === "fixed" && (
      <div className="mt-2">
        <Label htmlFor="yield_rate">Taxa Fixa (%)</Label>
        <Input
          id="yield_rate"
          type="number"
          step="0.01"
          min="0"
          value={yield_rate}
          onChange={e => onYieldRateChange(e.target.value)}
        />
      </div>
    )}
  </div>
);
export default InvestmentYieldField;
