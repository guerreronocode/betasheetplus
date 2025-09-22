import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { IncomeExpenseChart } from '@/components/IncomeExpenseChart';
import { MonthlyProjection } from '@/components/MonthlyProjection';
import { CategoryDashboard } from '@/components/CategoryDashboard';
import { BudgetVsRealized } from '@/components/BudgetVsRealized';
import { ExpensesByAccount } from '@/components/ExpensesByAccount';
import { ExpensesByCreditCard } from '@/components/ExpensesByCreditCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MonthlyBalance = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate month options
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  // Generate year options (current year ± 5)
  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);

  return (
    <Layout>
      <div className="bg-fnb-cream">      
        <main className="w-full px-4 py-4 overflow-hidden">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-fnb-ink">Balanço Mensal</h1>
              
              {/* Filtros de Período */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fnb-ink">Período:</span>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 w-full min-w-0">
            {/* Linha 1: Receitas/Despesas e Projeção Mensal - 3/5 e 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 min-w-0">
              <div className="lg:col-span-3 min-w-0">
                <IncomeExpenseChart 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
              </div>
              
              <div className="lg:col-span-2 min-w-0">
                <MonthlyProjection />
              </div>
            </div>

            {/* Linha 2: Dashboard por Categoria e Orçado vs Realizado - 3/5 e 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 min-w-0">
              <div className="lg:col-span-3 min-w-0">
                <CategoryDashboard 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
              </div>
              
              <div className="lg:col-span-2 min-w-0">
                <BudgetVsRealized 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
              </div>
            </div>

            {/* Linha 3: Gastos por Conta e Gastos por Cartão - 1/2 e 1/2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 min-w-0">
              <div className="min-w-0">
                <ExpensesByAccount 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
              </div>
              
              <div className="min-w-0">
                <ExpensesByCreditCard 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default MonthlyBalance;