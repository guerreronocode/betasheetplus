
import React from 'react';
import { Star, Target, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Goals = () => {
  const goals = [
    {
      id: 1,
      title: 'Emergência 6 meses',
      target: 15000,
      current: 8500,
      deadline: '2025-01-15',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Viagem Europa',
      target: 12000,
      current: 4200,
      deadline: '2025-07-01',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Curso de MBA',
      target: 25000,
      current: 18750,
      deadline: '2025-12-31',
      color: 'green'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cofrinhos por Meta</h3>
            <p className="text-sm text-gray-600">Acompanhe seu progresso</p>
          </div>
        </div>
        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          Ver todas
        </button>
      </div>

      <div className="space-y-6">
        {goals.map((goal, index) => {
          const progress = calculateProgress(goal.current, goal.target);
          const daysRemaining = getDaysRemaining(goal.deadline);
          
          return (
            <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{daysRemaining} dias</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {progress.toFixed(1)}%
                </span>
              </div>
              
              <Progress value={progress} className="h-3 mb-2" />
              
              {progress >= 100 && (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Meta alcançada! +50 pontos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default Goals;
