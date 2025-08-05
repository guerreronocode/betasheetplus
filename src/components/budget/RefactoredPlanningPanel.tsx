import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';
import { EnhancedBudgetProjectionChart } from './EnhancedBudgetProjectionChart';
import { PlannedIncomeList } from './PlannedIncomeList';
import { PlannedExpensesList } from './PlannedExpensesList';

export const RefactoredPlanningPanel: React.FC = () => {
  const { plannedIncome } = usePlannedIncome();
  const { plannedExpenses } = usePlannedExpenses();

  const totalPlannedIncome = plannedIncome.reduce((sum, income) => sum + income.planned_amount, 0);
  const totalPlannedExpenses = plannedExpenses.reduce((sum, expense) => sum + expense.planned_amount, 0);
  const estimatedBalance = totalPlannedIncome - totalPlannedExpenses;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="management">Gestão</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receitas Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalPlannedIncome.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {plannedIncome.length} registro(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Despesas Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalPlannedExpenses.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {plannedExpenses.length} registro(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo Líquido Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${estimatedBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {estimatedBalance.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por mês
                </p>
              </CardContent>
            </Card>
          </div>

          <EnhancedBudgetProjectionChart />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas Previstas</CardTitle>
                <CardDescription>
                  Configure suas receitas fixas e específicas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlannedIncomeList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas Previstas</CardTitle>
                <CardDescription>
                  Configure suas despesas fixas e específicas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlannedExpensesList />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
              <CardDescription>
                Visão geral das suas projeções financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900">Total de Receitas</h3>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {totalPlannedIncome.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-green-600">{plannedIncome.length} item(s)</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900">Total de Despesas</h3>
                  <p className="text-2xl font-bold text-red-700">
                    R$ {totalPlannedExpenses.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-red-600">{plannedExpenses.length} item(s)</p>
                </div>

                <div className={`text-center p-4 rounded-lg border ${
                  estimatedBalance >= 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`font-semibold ${
                    estimatedBalance >= 0 ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    Saldo Líquido
                  </h3>
                  <p className={`text-2xl font-bold ${
                    estimatedBalance >= 0 ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    R$ {estimatedBalance.toLocaleString('pt-BR')}
                  </p>
                  <p className={`text-sm ${
                    estimatedBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {estimatedBalance >= 0 ? 'Positivo' : 'Negativo'}
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900">Taxa de Economia</h3>
                  <p className="text-2xl font-bold text-purple-700">
                    {totalPlannedIncome > 0 
                      ? `${((estimatedBalance / totalPlannedIncome) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-sm text-purple-600">
                    Do total de receitas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};