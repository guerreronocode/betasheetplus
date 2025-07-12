
import React from "react";
import { DollarSign, Calendar, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomCategoryInput from "./CustomCategoryInput";

// Props shared
interface TransactionFormFieldsProps {
  type: "income" | "expense";
  form: any;
  handleChange: (partial: any) => void;
  categoryConfig: {
    categories: string[];
    addCategory: (c: string) => void;
    setCategories: (c: string[]) => void;
    sanitize: (v: string) => string;
  },
  bankAccounts: { id: string; name: string; bank_name: string; color?: string; }[];
}

const TransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
  type, form, handleChange, categoryConfig, bankAccounts
}) => {
  return (
    <>
      <div>
        <Label htmlFor={`${type}-description`}>Descrição</Label>
        <Input
          id={`${type}-description`}
          value={form.description}
          onChange={(e) => handleChange({ description: e.target.value })}
          placeholder={type === "income" ? "Ex: Salário de janeiro" : "Ex: Compras no supermercado"}
          required
        />
      </div>
      <div>
        <Label htmlFor={`${type}-amount`}>Valor</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id={`${type}-amount`}
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => handleChange({ amount: e.target.value })}
            placeholder="0.00"
            className="pl-10"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${type}-category`}>Categoria</Label>
        <Select
          value={form.category}
          onValueChange={(value) => handleChange({ category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryConfig.categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CustomCategoryInput
          value={form.category}
          setValue={(cat: string) => handleChange({ category: categoryConfig.sanitize(cat) })}
          categories={categoryConfig.categories}
          setCategories={categoryConfig.setCategories}
          placeholder={type === "income" ? "Nova categoria de Receita" : "Nova categoria de Despesa"}
        />
      </div>
      <div>
        <Label htmlFor={`${type}-bank-account`}>Conta Bancária *</Label>
        <Select
          value={form.bank_account_id}
          onValueChange={(value) => handleChange({ bank_account_id: value })}
          required
        >
          <SelectTrigger>
            <Building className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {bankAccounts.length === 0 ? (
              <SelectItem value="no-accounts" disabled>
                Nenhuma conta cadastrada
              </SelectItem>
            ) : (
              bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <span>{account.name} - {account.bank_name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {bankAccounts.length === 0 && (
          <p className="text-sm text-red-600 mt-1">
            Você precisa ter pelo menos uma conta bancária cadastrada para registrar transações.
          </p>
        )}
      </div>
      <div>
        <Label htmlFor={`${type}-date`}>Data</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id={`${type}-date`}
            type="date"
            value={form.date}
            onChange={(e) => handleChange({ date: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>
    </>
  )
}

export default TransactionFormFields;
