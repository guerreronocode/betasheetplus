
import React, { useState } from 'react';
import { Target, Link, TrendingUp, Calendar, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useFinancialData } from '@/hooks/useFinancialData';

const LinkedGoalsManager = () => {
  const { 
    goals, 
    investments, 
    addGoal, 
    updateGoal, 
    isAddingGoal = false,
    isUpdatingGoal = false
  } = useFinancialData();
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    color: '#3B82F6',
    linked_investment_id: 'none'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) return;

    const goalData = {
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || null,
      color: newGoal.color,
      linked_investment_id: newGoal.linked_investment_id === 'none' ? null : newGoal.linked_investment_id
    };

    if (editingGoal) {
      // Note: We would need to add an updateGoal function in useFinancialData
      console.log('Update goal:', { id: editingGoal.id, ...goalData });
      setEditingGoal(null);
    } else {
      addGoal(goalData);
    }

    setNewGoal({
      title: '',
      target_amount: '',
      deadline: '',
      color: '#3B82F6',
      linked_investment_id: 'none'
    });
    setShowAddGoal(false);
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      deadline: goal.deadline || '',
      color: goal.color || '#3B82F6',
      linked_investment_id: goal.linked_investment_id || 'none'
    });
    setShowAddGoal(true);
  };

  const getLinkedInvestmentValue = (linkedInvestmentId: string | null) => {
    if (!linkedInvestmentId) return 0;
    const investment = investments.find(inv => inv.id === linkedInvestmentId);
    return investment ? investment.current_value : 0;
  };

  const calculateProgress = (goal: any) => {
    if (goal.linked_investment_id) {
      const linkedValue = getLinkedInvestmentValue(goal.linked_investment_id);
      return Math.min((linkedValue / goal.target_amount) * 100, 100);
    }
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getCurrentAmount = (goal: any) => {
    if (goal.linked_investment_id) {
      return getLinkedInvestmentValue(goal.linked_investment_id);
    }
    return goal.current_amount;
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">Metas Financeiras</h3>
          </div>
          <Button onClick={() => setShowAddGoal(!showAddGoal)}>
            <Plus className="w-4 h-4 mr-2" />
            {editingGoal ? 'Cancelar Edição' : 'Nova Meta'}
          </Button>
        </div>

        {showAddGoal && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-title">Título da Meta</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Reserva de Emergência, Casa Própria"
                  required
                />
              </div>

              <div>
                <Label htmlFor="goal-amount">Valor Alvo</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  step="0.01"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="goal-deadline">Prazo (opcional)</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="goal-color">Cor</Label>
                <Input
                  id="goal-color"
                  type="color"
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="goal-investment">Vincular a Investimento (opcional)</Label>
                <Select
                  value={newGoal.linked_investment_id}
                  onValueChange={(value) => setNewGoal({ ...newGoal, linked_investment_id: value })}
                >
                  <SelectTrigger>
                    <Link className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Selecione um investimento para vinculação automática" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum investimento (controle manual)</SelectItem>
                    {investments.map((investment) => (
                      <SelectItem key={investment.id} value={investment.id}>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">📈</span>
                          <div>
                            <span className="font-medium">{investment.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatCurrency(investment.current_value)}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Ao vincular um investimento, o progresso da meta será atualizado automaticamente com o valor atual do investimento.
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isAddingGoal}>
                {isAddingGoal ? 'Salvando...' : editingGoal ? 'Atualizar Meta' : 'Criar Meta'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddGoal(false);
                setEditingGoal(null);
                setNewGoal({
                  title: '',
                  target_amount: '',
                  deadline: '',
                  color: '#3B82F6',
                  linked_investment_id: 'none'
                });
              }}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Nenhuma meta cadastrada</p>
              <p className="text-sm">Crie suas primeiras metas financeiras!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal);
              const currentAmount = getCurrentAmount(goal);
              const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
              const linkedInvestment = goal.linked_investment_id 
                ? investments.find(inv => inv.id === goal.linked_investment_id)
                : null;

              return (
                <Card key={goal.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: goal.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{goal.title}</h4>
                        {linkedInvestment && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <Link className="w-3 h-3" />
                            <span>Vinculado a {linkedInvestment.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(goal)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    
                    <Progress value={progress} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-semibold">{formatCurrency(currentAmount)}</span>
                        <span className="text-gray-600"> de {formatCurrency(goal.target_amount)}</span>
                      </div>
                      
                      {goal.deadline && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {daysUntilDeadline !== null && daysUntilDeadline >= 0 
                              ? `${daysUntilDeadline} dias restantes`
                              : 'Prazo vencido'
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {linkedInvestment && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800">Atualização automática via investimento</span>
                          </div>
                          <span className="text-blue-600 font-medium">
                            {linkedInvestment.yield_type.toUpperCase()} {linkedInvestment.yield_rate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {!goal.linked_investment_id && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Adicionar valor"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const amount = parseFloat(input.value);
                              if (amount > 0) {
                                updateGoal({ 
                                  id: goal.id, 
                                  current_amount: currentAmount + amount 
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const amount = parseFloat(input.value);
                            if (amount > 0) {
                              updateGoal({ 
                                id: goal.id, 
                                current_amount: currentAmount + amount 
                              });
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default LinkedGoalsManager;
