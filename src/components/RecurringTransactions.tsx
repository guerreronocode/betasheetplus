import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlannedIncome } from "@/hooks/usePlannedIncome";
import { usePlannedExpenses } from "@/hooks/usePlannedExpenses";
import HierarchicalCategorySelector from "./shared/HierarchicalCategorySelector";
import { Plus } from "lucide-react";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const RecurringTransactions = () => {
  const { createPlannedIncome } = usePlannedIncome();
  const { createPlannedExpense } = usePlannedExpenses();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    description: "",
    amount: "",
    category: "",
    installments: "1",
    startDate: format(new Date(), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category || !formData.installments) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const installments = parseInt(formData.installments);
    if (installments < 1) {
      toast.error("Número de parcelas deve ser maior que zero");
      return;
    }

    try {
      const startDate = new Date(formData.startDate);
      const amount = parseFloat(formData.amount);

      // Create multiple planned transactions (one for each installment)
      for (let i = 0; i < installments; i++) {
        const installmentDate = addMonths(startDate, i);
        const monthKey = format(installmentDate, "yyyy-MM-01");

        if (formData.type === "income") {
          await createPlannedIncome({
            category: formData.category,
            description: installments > 1 ? `${formData.description} (${i + 1}/${installments})` : formData.description,
            planned_amount: amount,
            month: monthKey,
            is_recurring: false,
          });
        } else {
          await createPlannedExpense({
            category: formData.category,
            description: installments > 1 ? `${formData.description} (${i + 1}/${installments})` : formData.description,
            planned_amount: amount,
            month: monthKey,
            is_recurring: false,
          });
        }
      }
      
      toast.success(`${installments} transação(ões) criada(s) com sucesso!`);
      resetForm();
    } catch (error) {
      console.error('Error creating planned transactions:', error);
      toast.error("Erro ao criar transações");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      description: "",
      amount: "",
      category: "",
      installments: "1",
      startDate: format(new Date(), "yyyy-MM-dd"),
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Criar Múltiplas Transações</CardTitle>
            <CardDescription>
              Crie várias transações futuras de uma vez (despesas ou receitas planejadas)
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Criar Transações
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-4">
          Use o botão acima para criar múltiplas transações de uma vez.
        </p>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Criar Múltiplas Transações
            </DialogTitle>
            <DialogDescription>
              Crie várias transações planejadas de uma vez
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.type === "expense" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                  >
                    Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === "income" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                  >
                    Receita
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Aluguel"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor por Parcela *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas *</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  value={formData.installments}
                  onChange={(e) =>
                    setFormData({ ...formData, installments: e.target.value })
                  }
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <HierarchicalCategorySelector
                value={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                placeholder="Selecione uma categoria"
                categoryType={formData.type}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data da Primeira Parcela *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!formData.description || !formData.amount || !formData.category || !formData.installments}
              >
                Criar Transações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecurringTransactions;
