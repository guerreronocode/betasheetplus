
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { useMonthlyObjectives, MonthlyObjective } from '@/hooks/useMonthlyObjectives';
import ObjectiveCard from './ObjectiveCard';
import CreateObjectiveDialog from './CreateObjectiveDialog';

const MonthlyObjectivesPanel = () => {
  const {
    objectives,
    isLoading,
    canAddMore,
    refreshProgress
  } = useMonthlyObjectives();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const completedCount = objectives.filter(obj => obj.status === 'completed').length;
  const inProgressCount = objectives.filter(obj => obj.status === 'in_progress').length;

  const handleRefreshAll = () => {
    objectives.forEach(obj => refreshProgress(obj.id));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mini Objetivos do Mês</h3>
              <p className="text-sm text-gray-600">
                {completedCount} concluídos • {inProgressCount} em andamento • {objectives.length}/3 objetivos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={objectives.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            {canAddMore && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Objetivo
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {objectives.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum objetivo definido ainda
              </h4>
              <p className="text-gray-600 mb-4">
                Crie até 3 objetivos financeiros para este mês
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Objetivo
              </Button>
            </div>
          ) : (
            objectives.map((objective, index) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                index={index}
              />
            ))
          )}
        </div>

        {objectives.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-800">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Progresso Geral:</span>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-blue-700">
              <span>✅ {completedCount} concluídos</span>
              <span>🔄 {inProgressCount} em andamento</span>
              <span>⏳ {objectives.length - completedCount - inProgressCount} pendentes</span>
            </div>
          </div>
        )}
      </Card>

      <CreateObjectiveDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default MonthlyObjectivesPanel;
