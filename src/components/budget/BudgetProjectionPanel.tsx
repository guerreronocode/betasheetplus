import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudgets } from '@/hooks/useBudgets';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { BudgetProjectionChart } from './BudgetProjectionChart';
import { PlannedIncomeList } from './PlannedIncomeList';

export const BudgetProjectionPanel: React.FC = () => {
  const { monthlyBudget } = useBudgets();
  const { plannedIncome } = usePlannedIncome();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">Gestão</TabsTrigger>
          <TabsTrigger value="projection">Projeção</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlannedIncomeList />

            <Card>
              <CardHeader>
                <CardTitle>Orçamento Atual</CardTitle>
                <CardDescription>
                  Gerencie seu orçamento mensal por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Orçamento Mensal</h3>
                    <p className="text-2xl font-bold">
                      {monthlyBudget?.total_amount 
                        ? `R$ ${monthlyBudget.total_amount.toLocaleString('pt-BR')}` 
                        : 'Não definido'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {monthlyBudget?.budget_categories?.length || 0} categorias
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Configure seu orçamento na aba "Orçamento" para visualizar a projeção anual
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          <BudgetProjectionChart />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orçamento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyBudget?.total_amount 
                    ? `R$ ${monthlyBudget.total_amount.toLocaleString('pt-BR')}` 
                    : 'Não definido'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {monthlyBudget?.budget_categories?.length || 0} categorias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receitas Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {plannedIncome
                    .reduce((sum, income) => sum + income.planned_amount, 0)
                    .toLocaleString('pt-BR')
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {plannedIncome.length} registro(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo Líquido Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(
                    plannedIncome.reduce((sum, income) => sum + income.planned_amount, 0) - 
                    (monthlyBudget?.total_amount || 0)
                  ).toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por mês
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};