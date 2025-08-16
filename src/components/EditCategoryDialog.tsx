import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHierarchicalCategories, Category } from '@/hooks/useHierarchicalCategories';
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
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { categories } = useHierarchicalCategories(categoryType);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parent_id || undefined);
    }
  }, [category]);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_categories')
        .update({
          name: name.trim(),
          parent_id: parentId || null
        })
        .eq('id', category.id);

      if (error) throw error;

      // Invalidar todas as queries de categorias para refletir mudanças imediatamente
      queryClient.invalidateQueries({ queryKey: ['user-categories'] });
      queryClient.invalidateQueries({ queryKey: ['existing-categories'] });

      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
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

  // Filtrar categorias que podem ser pai (não pode ser a própria categoria nem suas subcategorias)
  const availableParents = categories.filter(cat => 
    cat.id !== category.id && 
    !cat.parent_id && // Apenas categorias principais podem ser pais
    cat.id !== category.parent_id // Não incluir o pai atual se já for subcategoria
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Modifique o nome e a hierarquia da categoria.
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
          
          <div className="space-y-2">
            <Label htmlFor="parentCategory">Categoria Pai (opcional)</Label>
            <Select value={parentId || ""} onValueChange={(value) => setParentId(value && value !== "no-options" ? value : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria principal" />
              </SelectTrigger>
              <SelectContent>
                {availableParents.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {availableParents.length === 0 && (
                  <SelectItem value="no-options" disabled>
                    Nenhuma categoria principal
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {parentId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setParentId(undefined)}
                className="text-xs"
              >
                Remover categoria pai
              </Button>
            )}
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