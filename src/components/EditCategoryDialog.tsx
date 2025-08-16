import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category } from '@/hooks/useHierarchicalCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType: 'income' | 'expense';
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({ 
  category, 
  open, 
  onOpenChange, 
  categoryType 
}) => {
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_categories')
        .update({
          name: name.trim()
          // Não permitir alterar parent_id para manter hierarquia
        })
        .eq('id', category.id);

      if (error) throw error;

      // Invalidar todas as queries de categorias para refletir mudanças imediatamente
      queryClient.invalidateQueries({ queryKey: ['user-categories'] });
      queryClient.invalidateQueries({ queryKey: ['existing-categories'] });

      toast({
        title: "Categoria atualizada",
        description: "O nome da categoria foi atualizado com sucesso.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Modifique o nome da categoria.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nome da Categoria</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da categoria"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={!name.trim() || isUpdating}
          >
            {isUpdating ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;