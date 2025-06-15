
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type InvestmentLiquidityFieldProps = {
  value: string;
  vencimento?: string;
  onChange: (liquidity: string, vencimento?: string) => void;
};

const InvestmentLiquidityField: React.FC<InvestmentLiquidityFieldProps> = ({
  value,
  vencimento,
  onChange,
}) => (
  <div>
    <Label htmlFor="liquidity" className="block text-sm font-medium mb-1">
      Liquidez
    </Label>
    <Select value={value} onValueChange={val => onChange(val)}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a liquidez" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="diaria">Diária</SelectItem>
        <SelectItem value="vencimento">No vencimento</SelectItem>
      </SelectContent>
    </Select>
    {value === "vencimento" && (
      <div className="mt-2">
        <Label htmlFor="vencimento" className="block text-xs mb-1">Data de vencimento</Label>
        <Input
          id="vencimento"
          type="date"
          value={vencimento || ""}
          onChange={e => onChange(value, e.target.value)}
        />
      </div>
    )}
  </div>
);

export default InvestmentLiquidityField;
