import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlannedIncomeForm } from './PlannedIncomeForm';
import { BudgetProjectionChart } from './BudgetProjectionChart';
import { useBudgets } from '@/hooks/useBudgets';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';

export const BudgetProjectionPanel: React.FC = () => {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const { monthlyBudget, yearlyBudget, isLoading: budgetsLoading } = useBudgets();
  const { plannedIncome, isLoading: incomeLoading } = usePlannedIncome();

  const isLoading = budgetsLoading || incomeLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Orçamento</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Projeção de Orçamento Anual</CardTitle>
              <CardDescription>
                Visualize sua projeção financeira com base no orçamento e receitas previstas
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowIncomeForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Receita Prevista
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projection" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projection">Projeção Anual</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
            </TabsList>

            <TabsContent value="projection" className="space-y-4">
              <BudgetProjectionChart />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
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
                    <CardTitle className="text-sm font-medium">Receitas Previstas</CardTitle>
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

              {/* Lista de receitas previstas */}
              {plannedIncome.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Receitas Previstas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plannedIncome.map((income) => (
                        <div key={income.id} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{income.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(income.month).toLocaleDateString('pt-BR', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ {income.planned_amount.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PlannedIncomeForm 
        open={showIncomeForm}
        onOpenChange={setShowIncomeForm}
      />
    </div>
  );
};