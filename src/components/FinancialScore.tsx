
import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FinancialScore = () => {
  const score = 750; // Score de 0 a 1000
  const scorePercentage = (score / 1000) * 100;
  
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 400) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excelente';
    if (score >= 600) return 'Bom';
    if (score >= 400) return 'Regular';
    return 'Precisa melhorar';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Score de Saúde Financeira</h3>
            <p className="text-sm text-gray-600">Baseado na sua situação atual</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
          score >= 800 ? 'bg-green-100 text-green-800' :
          score >= 600 ? 'bg-yellow-100 text-yellow-800' :
          score >= 400 ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {getScoreLabel(score)}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ${
            score >= 800 ? 'bg-green-500' :
            score >= 600 ? 'bg-yellow-500' :
            score >= 400 ? 'bg-orange-500' :
            'bg-red-500'
          }`}
          style={{ width: `${scorePercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Receitas</p>
          <p className="font-semibold text-green-600">+8pts</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Gastos</p>
          <p className="font-semibold text-orange-600">-3pts</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Poupança</p>
          <p className="font-semibold text-blue-600">+12pts</p>
        </div>
      </div>
    </Card>
  );
};

export default FinancialScore;
