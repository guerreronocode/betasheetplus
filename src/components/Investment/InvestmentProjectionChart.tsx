
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentProjectionChartProps {
  data: Array<{
    month: number;
    invested: number;
    accumulated: number;
    yield: number;
  }>;
}

const InvestmentProjectionChart: React.FC<InvestmentProjectionChartProps> = ({ data }) => {
  const formatTooltip = (value: number, name: string) => {
    const labels: Record<string, string> = {
      invested: 'Total Investido',
      accumulated: 'Valor Acumulado',
      yield: 'Rendimento',
    };
    
    return [formatCurrency(value), labels[name] || name];
  };

  const formatLabel = (month: number) => {
    if (month === 0) return 'Início';
    return `${month}º mês`;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatLabel}
            stroke="#666"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, { compact: true })}
            stroke="#666"
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={formatLabel}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="invested" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="invested"
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="accumulated" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="accumulated"
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="yield" 
            stroke="#ffc658" 
            strokeWidth={2}
            name="yield"
            dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentProjectionChart;
