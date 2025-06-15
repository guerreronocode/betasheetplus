
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assetCategoryOptions, liabilityCategoryOptions } from "./patrimonyCategories";

interface PatrimonyFormFieldsProps {
  entryType: "asset" | "liability";
  form: any;
  onChange: (val: any) => void;
  investments: any[];
  bankAccounts: any[];
}

export const PatrimonyFormFields: React.FC<PatrimonyFormFieldsProps> = ({
  entryType,
  form,
  onChange,
  investments,
  bankAccounts,
}) => {
  return (
    <>
      {/* SELEÇÃO MANUAL/LINKADA */}
      {entryType === "asset" && (
        <div>
          <Label>Tipo de vínculo</Label>
          <Select
            value={form.linkType}
            onValueChange={linkType =>
              onChange({
                ...form,
                linkType,
                linkedInvestmentId: "",
                linkedBankAccountId: "",
                name: "",
                value: "",
                category: ""
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de ativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Informar valor manualmente</SelectItem>
              <SelectItem value="investment">Adicionar investimento já registrado</SelectItem>
              <SelectItem value="bank">Adicionar conta bancária já cadastrada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* CAMPOS PARA ATIVO - MANUAL */}
      {entryType === "asset" && (form.linkType === "manual" || !form.linkType) && (
        <>
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              min={0}
              value={form.value}
              onChange={e => onChange({ ...form, value: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={cat => onChange({ ...form, category: cat })} required>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {assetCategoryOptions
                  .filter(opt => typeof opt.value === "string" && opt.value.trim().length > 0)
                  .map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* VÍNCULO COM INVESTIMENTO */}
      {entryType === "asset" && form.linkType === "investment" && (
        <div>
          <Label>Selecionar investimento</Label>
          <Select
            value={form.linkedInvestmentId}
            onValueChange={id => onChange({ ...form, linkedInvestmentId: id })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha um investimento" />
            </SelectTrigger>
            <SelectContent>
              {investments
                .filter(inv => typeof inv.id === "string" && inv.id.trim().length > 0)
                .map(inv => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name} ({inv.current_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* VÍNCULO COM CONTA BANCÁRIA */}
      {entryType === "asset" && form.linkType === "bank" && (
        <div>
          <Label>Selecionar conta bancária</Label>
          <Select
            value={form.linkedBankAccountId}
            onValueChange={id => onChange({ ...form, linkedBankAccountId: id })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma conta" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts
                .filter(acc => typeof acc.id === "string" && acc.id.trim().length > 0)
                .map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} - {acc.bank_name} (
                    {acc.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* FORM PASSIVO*/}
      {entryType === "liability" && (
        <>
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              min={0}
              value={form.value}
              onChange={e => onChange({ ...form, value: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={cat => onChange({ ...form, category: cat })} required>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {liabilityCategoryOptions
                  .filter(opt => typeof opt.value === "string" && opt.value.trim().length > 0)
                  .map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </>
  );
};
