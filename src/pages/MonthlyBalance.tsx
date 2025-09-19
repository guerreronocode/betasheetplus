import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';
import IncomeExpenseChart from '@/components/IncomeExpenseChart';
import MonthlyProjection from '@/components/MonthlyProjection';

const MonthlyBalance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <Layout>
      <div className="bg-fnb-cream">      
        <main className="max-w-8xl mx-auto px-4 py-4">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-fnb-ink mb-4">Balanço Mensal</h1>
            
            {/* Filtros de Período */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-fnb-ink" />
                <span className="text-sm font-medium text-fnb-ink">Período:</span>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-border rounded-md bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-border rounded-md bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 max-w-full">
            {/* Linha com Receitas/Despesas e Projeção Mensal - 3/5 e 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
              <div className="lg:col-span-3">
                <IncomeExpenseChart 
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                />
              </div>
              
              <div className="lg:col-span-2">
                <MonthlyProjection />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default MonthlyBalance;