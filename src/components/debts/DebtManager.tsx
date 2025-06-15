
import React, { useState } from "react";
import { FolderOpen, Debt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Modelo básico de dívida
type Debt = {
  id: string;
  name: string;
  total: number;
  remaining: number;
  dueDate: string;
  interest: number;
};

const DebtManager: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "1",
      name: "Cartão de Crédito",
      total: 3200,
      remaining: 2050,
      dueDate: "2025-07-10",
      interest: 9.99,
    },
    {
      id: "2",
      name: "Financiamento Carro",
      total: 30000,
      remaining: 14200,
      dueDate: "2027-02-01",
      interest: 2.39,
    }
  ]);
  const [form, setForm] = useState({
    name: "",
    total: "",
    remaining: "",
    dueDate: "",
    interest: "",
  });

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.total || !form.remaining) return;
    setDebts(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: form.name,
        total: Number(form.total),
        remaining: Number(form.remaining),
        dueDate: form.dueDate,
        interest: Number(form.interest || 0),
      }
    ]);
    setForm({ name: "", total: "", remaining: "", dueDate: "", interest: "" });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Debt className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciador de Dívidas
            </h3>
            <p className="text-sm text-gray-600">Controle e analise suas dívidas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddDebt} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div>
          <Label>Nome</Label>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Cartão Nubank"
            required
          />
        </div>
        <div>
          <Label>Valor total (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.total}
            onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Restante (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.remaining}
            onChange={e => setForm(f => ({ ...f, remaining: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Vencimento</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
          />
        </div>
        <div>
          <Label>Juros (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.interest}
            onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
          />
        </div>
        <div className="md:col-span-5 flex justify-end mt-2">
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Adicionar Dívida
          </Button>
        </div>
      </form>

      <div className="divide-y divide-gray-100">
        {debts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma dívida cadastrada.</p>
          </div>
        ) : (
          debts.map(debt => (
            <div key={debt.id} className="flex justify-between items-center py-3">
              <div>
                <div className="text-base font-medium text-gray-900">{debt.name}</div>
                <div className="text-xs text-gray-600">
                  Total: R${debt.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} &nbsp;|&nbsp;
                  Restante: R${debt.remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} &nbsp;|&nbsp;
                  Venc.: {debt.dueDate || "-"} &nbsp;|&nbsp;
                  Juros: {debt.interest ? debt.interest + "%" : "-"}
                </div>
              </div>
              {/* Futuramente: adicionar botões de editar/remover */}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default DebtManager;
