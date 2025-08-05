import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { usePlannedIncome, PlannedIncome } from '@/hooks/usePlannedIncome';
import { RecurringIncomeForm } from './RecurringIncomeForm';
import { EditPlannedIncomeDialog } from './EditPlannedIncomeDialog';

export const PlannedIncomeList: React.FC = () => {
  const { plannedIncome, deletePlannedIncome, isDeleting } = usePlannedIncome();
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<PlannedIncome | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonth = (dateString: string) => {
    // Usar o formato direto para evitar problemas de timezone
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      salario: 'Salário',
      freelance: 'Freelance',
      bonus: 'Bônus',
      investimentos: 'Investimentos',
      aluguel: 'Aluguel Recebido',
      pensao: 'Pensão',
      vendas: 'Vendas',
      dividendos: 'Dividendos',
      outros: 'Outros',
    };
    return categories[category] || category;
  };

  // Separar receitas recorrentes das específicas
  const recurringIncome = plannedIncome.filter(income => income.is_recurring);
  const specificIncome = plannedIncome.filter(income => !income.is_recurring);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Receitas Configuradas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie suas receitas fixas e específicas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Receitas Recorrentes */}
      {recurringIncome.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas Fixas (Recorrentes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurringIncome.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getCategoryLabel(income.category)}</span>
                    <Badge variant="secondary">Recorrente</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {income.description && <span>{income.description} • </span>}
                    <span>
                      A partir de {formatMonth(income.recurring_start_month || income.month)}
                      {income.recurring_end_month && ` até ${formatMonth(income.recurring_end_month)}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {formatCurrency(income.planned_amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIncome(income)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlannedIncome(income.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Receitas Específicas */}
      {specificIncome.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receitas Específicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {specificIncome.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getCategoryLabel(income.category)}</span>
                    <Badge variant="outline">{formatMonth(income.month)}</Badge>
                  </div>
                  {income.description && (
                    <div className="text-sm text-muted-foreground">
                      {income.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {formatCurrency(income.planned_amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIncome(income)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlannedIncome(income.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {plannedIncome.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhuma receita configurada ainda
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Receita
            </Button>
          </CardContent>
        </Card>
      )}

      <RecurringIncomeForm open={showForm} onOpenChange={setShowForm} />
      
      {editingIncome && (
        <EditPlannedIncomeDialog
          income={editingIncome}
          open={!!editingIncome}
          onOpenChange={(open) => !open && setEditingIncome(null)}
        />
      )}
    </div>
  );
};