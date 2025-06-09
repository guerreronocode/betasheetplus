
import React, { useState } from 'react';
import { Star, Target, Calendar, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useFinancialData } from '@/hooks/useFinancialData';

const UpdatedGoals = () => {
  const { goals, updateGoal, isUpdatingGoal } = useFinancialData();
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDeposit = (goalId: string, currentAmount: number) => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    updateGoal({
      id: goalId,
      current_amount: currentAmount + amount
    });
    
    setDepositAmount('');
    setUpdatingGoalId(null);
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
            <p className="text-sm text-gray-600">Acompanhe e atualize seu progresso</p>
          </div>
        </div>
        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          Ver todas
        </button>
      </div>

      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma meta encontrada</p>
            <p className="text-sm">Crie suas primeiras metas financeiras!</p>
          </div>
        ) : (
          goals.map((goal, index) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {daysRemaining !== null ? (
                        daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencida'
                      ) : 'Sem prazo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                
                <Progress value={progress} className="h-3 mb-3" />
                
                {isCompleted ? (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <Star className="w-4 h-4" />
                    <span>Meta alcançada! +50 pontos</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {updatingGoalId === goal.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Valor a depositar"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleDeposit(goal.id, goal.current_amount)}
                          disabled={isUpdatingGoal}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isUpdatingGoal ? 'Depositando...' : 'Depositar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUpdatingGoalId(null);
                            setDepositAmount('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUpdatingGoalId(goal.id)}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Depositar
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default UpdatedGoals;
