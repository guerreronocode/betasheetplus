import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const banks = [
  "Itaú", "Bradesco", "Banco do Brasil", "Santander", "Caixa", "Nubank", "Inter", "XP", "BTG", "C6 Bank", "Outro"
];

const accountTypes = [
  { value: "checking", label: "Conta Corrente" },
  { value: "savings", label: "Conta Poupança" },
  { value: "investment", label: "Conta Investimento" }
];

interface BankAccountFormProps {
  form: any;
  onChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
  onCancel?: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  form,
  onChange,
  onSubmit,
  isSaving,
  onCancel
}) => {
  const [localError, setLocalError] = React.useState<string | null>(null);

  const validateBeforeSubmit = (e: React.FormEvent) => {
    setLocalError(null);
    if (isSaving) {
      e.preventDefault();
      setLocalError("Por favor, aguarde o salvamento.");
      return;
    }
    if (!form.name?.trim()) {
      e.preventDefault();
      setLocalError("Informe o nome da conta.");
      return;
    }
    if (!form.bank_name?.trim()) {
      e.preventDefault();
      setLocalError("Selecione o banco.");
      return;
    }
    if (!form.balance || isNaN(Number(form.balance)) || Number(form.balance) < 0) {
      e.preventDefault();
      setLocalError("Informe um saldo válido (número maior ou igual a zero).");
      return;
    }
    if (!form.account_type) {
      e.preventDefault();
      setLocalError("Escolha um tipo de conta.");
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={validateBeforeSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {localError && (
        <div className="bg-red-100 text-red-600 border-l-4 border-red-400 p-2 text-xs rounded">
          {localError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome da Conta</Label>
          <Input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Ex: Conta Principal"
            required
          />
        </div>
        <div>
          <Label htmlFor="bank_name">Banco</Label>
          <Select
            value={form.bank_name}
            onValueChange={(value) => onChange({ ...form, bank_name: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              {banks.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="account_type">Tipo de Conta</Label>
          <Select
            value={form.account_type}
            onValueChange={value => onChange({ ...form, account_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="balance">Saldo Atual</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            min="0"
            value={form.balance}
            onChange={(e) => onChange({ ...form, balance: e.target.value })}
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            type="color"
            value={form.color}
            onChange={(e) => onChange({ ...form, color: e.target.value })}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Adicionar Conta"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default BankAccountForm;
