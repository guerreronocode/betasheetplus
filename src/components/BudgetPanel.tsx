
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import BudgetForm from './BudgetForm';
import BudgetComparison from './BudgetComparison';

const BudgetPanel = () => {
  const {
    monthlyBudget,
    yearlyBudget,
    isLoading
  } = useBudgets();

  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [showYearlyForm, setShowYearlyForm] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Planejamento Financeiro</h3>
              <p className="text-sm text-gray-600">
                Gerencie seus orçamentos mensais e anuais
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Orçamento Mensal</TabsTrigger>
            <TabsTrigger value="yearly">Orçamento Anual</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">
                Orçamento do Mês Atual
              </h4>
              <Button
                onClick={() => setShowMonthlyForm(true)}
                size="sm"
                variant={monthlyBudget ? "outline" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {monthlyBudget ? 'Editar' : 'Criar'} Orçamento
              </Button>
            </div>

            {monthlyBudget ? (
              <BudgetComparison 
                budget={monthlyBudget} 
                period="monthly"
              />
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum orçamento mensal
                </h4>
                <p className="text-gray-600 mb-4">
                  Crie um orçamento para acompanhar seus gastos mensais
                </p>
                <Button onClick={() => setShowMonthlyForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Orçamento Mensal
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">
                Orçamento do Ano Atual
              </h4>
              <Button
                onClick={() => setShowYearlyForm(true)}
                size="sm"
                variant={yearlyBudget ? "outline" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {yearlyBudget ? 'Editar' : 'Criar'} Orçamento
              </Button>
            </div>

            {yearlyBudget ? (
              <BudgetComparison 
                budget={yearlyBudget} 
                period="yearly"
              />
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum orçamento anual
                </h4>
                <p className="text-gray-600 mb-4">
                  Crie um orçamento para acompanhar seus gastos anuais
                </p>
                <Button onClick={() => setShowYearlyForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Orçamento Anual
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modais de formulário */}
      <BudgetForm
        open={showMonthlyForm}
        onOpenChange={setShowMonthlyForm}
        period="monthly"
        existingBudget={monthlyBudget}
      />

      <BudgetForm
        open={showYearlyForm}
        onOpenChange={setShowYearlyForm}
        period="yearly"
        existingBudget={yearlyBudget}
      />
    </div>
  );
};

export default BudgetPanel;
