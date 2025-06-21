
import React from 'react';
import { CheckCircle, Circle, Clock, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMonthlyObjectives, MonthlyObjective } from '@/hooks/useMonthlyObjectives';

interface ObjectiveCardProps {
  objective: MonthlyObjective;
  index: number;
}

const ObjectiveCard = ({ objective, index }: ObjectiveCardProps) => {
  const { deleteObjective, refreshProgress } = useMonthlyObjectives();

  const getStatusIcon = () => {
    switch (objective.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (objective.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getProgressValue = () => {
    if (objective.calculation_type === 'value' && objective.target_value) {
      return Math.min((objective.current_value / objective.target_value) * 100, 100);
    } else if (objective.calculation_type === 'percentage' && objective.target_percentage) {
      return Math.min((objective.current_percentage / objective.target_percentage) * 100, 100);
    }
    return 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${getStatusColor()}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">
            {getStatusIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-medium ${
                objective.status === 'completed' ? 'text-green-900 line-through' : 'text-gray-900'
              }`}>
                {objective.title}
              </h4>
              
              <div className="flex items-center space-x-2">
                {objective.objective_type === 'suggested' && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    Sugerido
                  </span>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshProgress(objective.id)}
                  className="h-6 w-6 p-0"
                >
                  <BarChart3 className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteObjective(objective.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {objective.description && (
              <p className={`text-sm mb-3 ${
                objective.status === 'completed' ? 'text-green-700' : 'text-gray-600'
              }`}>
                {objective.description}
              </p>
            )}

            {objective.status !== 'completed' && (
              <div className="space-y-2">
                <Progress value={getProgressValue()} className="h-2" />
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {objective.calculation_type === 'value' && objective.target_value && (
                      <>
                        {formatCurrency(objective.current_value)} de {formatCurrency(objective.target_value)}
                      </>
                    )}
                    {objective.calculation_type === 'percentage' && objective.target_percentage && (
                      <>
                        {formatPercentage(objective.current_percentage)} de {formatPercentage(objective.target_percentage)}
                      </>
                    )}
                  </span>
                  <span className="font-medium">
                    {getProgressValue().toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
            
            {objective.status === 'completed' && objective.completed_at && (
              <div className="text-xs text-green-600 mt-2">
                ✅ Concluído em {new Date(objective.completed_at).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveCard;
