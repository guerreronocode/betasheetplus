
import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialData } from '@/hooks/useFinancialData';

const AdvancedGoalsPanel = () => {
  const { goals, addGoal, updateGoal, isUpdatingGoal } = useFinancialData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    color: 'blue'
  });

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

  const getGoalStatus = (goal: any) => {
    const progress = calculateProgress(goal.current_amount, goal.target_amount);
    const daysRemaining = getDaysRemaining(goal.deadline);
    
    if (progress >= 100) return { status: 'completed', color: 'green' };
    if (daysRemaining !== null && daysRemaining < 0) return { status: 'overdue', color: 'red' };
    if (daysRemaining !== null && daysRemaining <= 7) return { status: 'urgent', color: 'orange' };
    return { status: 'active', color: 'blue' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) return;

    addGoal({
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || null,
      color: newGoal.color
    });

    setNewGoal({
      title: '',
      target_amount: '',
      deadline: '',
      color: 'blue'
    });
    setIsAddingNew(false);
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

  const completedGoals = goals.filter(g => calculateProgress(g.current_amount, g.target_amount) >= 100);
  const activeGoals = goals.filter(g => calculateProgress(g.current_amount, g.target_amount) < 100);
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);

  return (
    <div className="space-y-6">
      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Metas Ativas</p>
              <p className="text-lg font-semibold">{activeGoals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-lg font-semibold">{completedGoals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Alvo</p>
              <p className="text-lg font-semibold">{formatCurrency(totalTargetAmount)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso</p>
              <p className="text-lg font-semibold">
                {totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add New Goal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gerenciar Metas</h3>
          <Button onClick={() => setIsAddingNew(!isAddingNew)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {isAddingNew && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Meta</Label>
                <Input
                  id="title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Reserva de Emergência"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="target_amount">Valor Alvo</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline">Prazo (Opcional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="color">Cor</Label>
                <Select value={newGoal.color} onValueChange={(value) => setNewGoal({ ...newGoal, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit">Criar Meta</Button>
              <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Goals List */}
        <div className="space-y-4">
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
              const goalStatus = getGoalStatus(goal);
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <Card className={`p-4 border-l-4 ${
                    goalStatus.color === 'green' ? 'border-l-green-500' :
                    goalStatus.color === 'red' ? 'border-l-red-500' :
                    goalStatus.color === 'orange' ? 'border-l-orange-500' :
                    'border-l-blue-500'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <Badge variant={goalStatus.status === 'completed' ? 'default' : 'outline'}>
                          {goalStatus.status === 'completed' && 'Completada'}
                          {goalStatus.status === 'overdue' && 'Vencida'}
                          {goalStatus.status === 'urgent' && 'Urgente'}
                          {goalStatus.status === 'active' && 'Ativa'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {daysRemaining !== null && (
                          <>
                            <Calendar className="w-4 h-4" />
                            <span>
                              {daysRemaining > 0 ? `${daysRemaining} dias` : 
                               daysRemaining === 0 ? 'Hoje' : 'Vencida'}
                            </span>
                          </>
                        )}
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
                        <CheckCircle className="w-4 h-4" />
                        <span>Meta alcançada! +100 pontos</span>
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
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdvancedGoalsPanel;
