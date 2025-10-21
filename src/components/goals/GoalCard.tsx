import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Check, Calendar, Upload, X } from 'lucide-react';
import { Goal, useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditGoalDialog from './EditGoalDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  const { deleteGoal, updateGoal, isDeletingGoal } = useGoals();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - (goal.current_amount || 0), 0);
  const isCompleted = goal.completed || (goal.current_amount || 0) >= goal.target_amount;

  // Cálculo de sugestão de aporte mensal
  const calculateMonthlySuggestion = () => {
    if (!goal.deadline || isCompleted) {
      return 0;
    }

    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    return remaining / monthsRemaining;
  };

  const monthlySuggestion = calculateMonthlySuggestion();

  const handleToggleComplete = () => {
    updateGoal({
      id: goal.id,
      completed: !goal.completed,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja remover esta meta?')) {
      deleteGoal(goal.id);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (300KB = 300 * 1024 bytes)
    if (file.size > 300 * 1024) {
      toast.error('A imagem deve ter no máximo 300KB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Upload para storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${goal.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('goal-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('goal-images')
        .getPublicUrl(fileName);

      // Atualizar meta com URL da imagem
      await updateGoal({
        id: goal.id,
        image_url: publicUrl,
      });

      toast.success('Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await updateGoal({
        id: goal.id,
        image_url: null,
      });
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem');
    }
  };

  return (
    <>
      <div className="relative bg-card border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg h-full min-h-[240px]">
        <div className="flex gap-4 p-6 h-full">
          {/* Imagem */}
          <div 
            className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden cursor-pointer group"
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
            onClick={handleImageClick}
          >
            {goal.image_url ? (
              <>
                <img 
                  src={goal.image_url} 
                  alt={goal.title}
                  className="w-full h-full object-cover"
                />
                {imageHover && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white"
                      onClick={handleImageClick}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                {isUploading ? (
                  <div className="animate-spin">⏳</div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Adicionar foto</span>
                    <span className="text-xs">(máx 300KB)</span>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Detalhes */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {goal.title}
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Concluída
                    </Badge>
                  )}
                </h3>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleComplete}
                  className="h-8 w-8 p-0"
                  disabled={(goal.current_amount || 0) < goal.target_amount}
                >
                  <Check className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeletingGoal}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Valor Total</p>
                <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Valor Atual</p>
                <p className="font-semibold text-green-600">{formatCurrency(goal.current_amount || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Restante</p>
                <p className="font-semibold text-orange-600">{formatCurrency(remaining)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Investido</p>
                <p className="font-semibold">{formatCurrency(goal.current_amount || 0)}</p>
              </div>
            </div>

            {goal.deadline && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Prazo: {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            )}

            {!isCompleted && monthlySuggestion > 0 && (
              <div className="bg-muted/50 rounded p-2 text-xs">
                <p className="text-muted-foreground">Sugestão de aporte mensal</p>
                <p className="font-semibold text-sm">{formatCurrency(monthlySuggestion)}</p>
              </div>
            )}

            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <EditGoalDialog
        goal={goal}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
};
