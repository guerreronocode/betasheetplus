
import React from "react";
import { assetCategoryOptions, liabilityCategoryOptions } from "./ImprovedPatrimonyManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PatrimonyFormProps {
  form: any;
  entryType: "asset" | "liability";
  onChange: (value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit?: () => void;
  isSaving?: boolean;
  investments: any[];
  bankAccounts: any[];
}

const PatrimonyForm: React.FC<PatrimonyFormProps> = ({
  form,
  entryType,
  onChange,
  onSubmit,
  onCancelEdit,
  isSaving,
  investments,
  bankAccounts,
}) => (
  <form onSubmit={onSubmit} className="space-y-2 border rounded p-4 mt-2 bg-gray-50">
    <div className="flex gap-2 mb-3">
      <Button
        type="button"
        variant={entryType === "asset" ? "default" : "outline"}
        onClick={() => onChange({ ...form, entryType: "asset" })}
      >
        Ativo
      </Button>
      <Button
        type="button"
        variant={entryType === "liability" ? "default" : "outline"}
        onClick={() => onChange({ ...form, entryType: "liability" })}
      >
        Passivo
      </Button>
      {form.isEdit && onCancelEdit && (
        <Button type="button" variant="secondary" className="ml-2" onClick={onCancelEdit}>
          Cancelar edição
        </Button>
      )}
    </div>
    {/* Entrada dinâmica: tipo de vínculo */}
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
    {/* Form assets - manual */}
    {entryType === "asset" && (form.linkType === "manual" || form.linkType === "") && (
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
    {/* Passivo */}
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
    <Button type="submit" className="w-full" disabled={isSaving}>
      {form.isEdit ? "Salvar alterações" : "Adicionar"}
    </Button>
  </form>
);

export default PatrimonyForm;
