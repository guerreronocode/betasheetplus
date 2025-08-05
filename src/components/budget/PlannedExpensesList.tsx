import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { usePlannedExpenses, PlannedExpense } from '@/hooks/usePlannedExpenses';
import { PlannedExpenseForm } from './PlannedExpenseForm';
import { EditPlannedExpenseDialog } from './EditPlannedExpenseDialog';

export const PlannedExpensesList: React.FC = () => {
  const { plannedExpenses, deletePlannedExpense, isDeleting } = usePlannedExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);

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
      alimentacao: 'Alimentação',
      transporte: 'Transporte',
      moradia: 'Moradia',
      saude: 'Saúde',
      educacao: 'Educação',
      entretenimento: 'Entretenimento',
      vestuario: 'Vestuário',
      servicos: 'Serviços',
      impostos: 'Impostos',
      financas: 'Finanças',
      outros: 'Outros',
    };
    return categories[category] || category;
  };

  // Separar despesas recorrentes das específicas
  const recurringExpenses = plannedExpenses.filter(expense => expense.is_recurring);
  const specificExpenses = plannedExpenses.filter(expense => !expense.is_recurring);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Despesas Configuradas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie suas despesas fixas e específicas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Despesas Recorrentes */}
      {recurringExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas Fixas (Recorrentes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getCategoryLabel(expense.category)}</span>
                    <Badge variant="secondary">Recorrente</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {expense.description && <span>{expense.description} • </span>}
                    <span>
                      A partir de {formatMonth(expense.recurring_start_month || expense.month)}
                      {expense.recurring_end_month && ` até ${formatMonth(expense.recurring_end_month)}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {formatCurrency(expense.planned_amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlannedExpense(expense.id)}
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

      {/* Despesas Específicas */}
      {specificExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas Específicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {specificExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getCategoryLabel(expense.category)}</span>
                    <Badge variant="outline">{formatMonth(expense.month)}</Badge>
                  </div>
                  {expense.description && (
                    <div className="text-sm text-muted-foreground">
                      {expense.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {formatCurrency(expense.planned_amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlannedExpense(expense.id)}
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

      {plannedExpenses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhuma despesa configurada ainda
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Despesa
            </Button>
          </CardContent>
        </Card>
      )}

      <PlannedExpenseForm open={showForm} onOpenChange={setShowForm} />
      
      {editingExpense && (
        <EditPlannedExpenseDialog
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}
    </div>
  );
};