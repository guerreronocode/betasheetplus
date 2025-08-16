import React, { useState } from 'react';
import { Plus, Trash2, FolderPlus, Tag, Edit, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useHierarchicalCategories, Category } from '@/hooks/useHierarchicalCategories';
import EditCategoryDialog from './EditCategoryDialog';

interface CategoryManagerProps {
  categoryType?: 'income' | 'expense';
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categoryType = 'expense' }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<Category | null>(null);
  
  const {
    categories,
    createCategory,
    deleteCategory,
    isLoading,
    isCreating,
    isDeleting
  } = useHierarchicalCategories(categoryType);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategory({
      name: newCategoryName.trim(),
      parent_id: selectedParent || addingSubcategoryTo?.id || null,
      category_type: categoryType
    });
    
    setNewCategoryName('');
    setSelectedParent('');
    setAddingSubcategoryTo(null);
  };

  const handleAddSubcategory = (parentCategory: Category) => {
    setAddingSubcategoryTo(parentCategory);
    setSelectedParent(parentCategory.id);
  };

  const renderCategory = (category: Category, level = 0) => (
    <div key={category.id} className={`space-y-2 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          {level === 0 ? (
            <Tag className="w-4 h-4 text-primary" />
          ) : (
            <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground ml-2" />
          )}
          <Badge variant={level === 0 ? 'default' : 'secondary'}>
            {category.name}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {level === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddSubcategory(category)}
              className="text-muted-foreground hover:text-primary"
              title="Adicionar subcategoria"
            >
              <Users className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingCategory(category)}
            className="text-muted-foreground hover:text-primary"
            title="Editar categoria"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCategory(category.id)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
            title="Excluir categoria"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {category.subcategories?.map(subcat => renderCategory(subcat, level + 1))}
    </div>
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderPlus className="w-5 h-5" />
          Gerenciar Categorias
        </CardTitle>
        <CardDescription>
          Organize suas categorias de {categoryType === 'income' ? 'receita' : 'despesa'} com até 2 níveis de hierarquia (categoria {'->'} sub-categoria)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Lista de categorias com botão de adição no topo */}
        <div className="space-y-3">
          {/* Botão para adicionar nova categoria */}
          <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex items-center justify-center p-6" onClick={() => {
              if (addingSubcategoryTo) {
                setAddingSubcategoryTo(null);
                setSelectedParent('');
              }
            }}>
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {addingSubcategoryTo 
                    ? `Clique aqui para parar de adicionar subcategoria a "${addingSubcategoryTo.name}"`
                    : 'Clique aqui para adicionar uma nova categoria'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulário para criar nova categoria (mostrado quando necessário) */}
          {(addingSubcategoryTo || newCategoryName) && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Alimentação, Lazer..."
                    maxLength={50}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Categoria Pai (opcional)</Label>
                  <Select value={selectedParent || ""} onValueChange={(value) => setSelectedParent(value && value !== "no-options" ? value : "")} disabled={!!addingSubcategoryTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Criar como categoria principal" />
                    </SelectTrigger>
                   <SelectContent>
                      {categories.filter(cat => !cat.parent_id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      {categories.filter(cat => !cat.parent_id).length === 0 && (
                        <SelectItem value="no-options" disabled>
                          Nenhuma categoria principal
                        </SelectItem>
                      )}
                    </SelectContent>
                   </Select>
                   {selectedParent && !addingSubcategoryTo && (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setSelectedParent('')}
                       className="text-xs"
                     >
                       Remover categoria pai
                     </Button>
                   )}
                 </div>
                
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || isCreating}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addingSubcategoryTo ? 'Criar Sub-categoria' : (selectedParent ? 'Criar Sub-categoria' : 'Criar Categoria')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setNewCategoryName('');
                      setSelectedParent('');
                      setAddingSubcategoryTo(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
              
              {(selectedParent || addingSubcategoryTo) && (
                <div className="text-sm text-muted-foreground">
                  <strong>Criando sub-categoria de:</strong> {
                    addingSubcategoryTo?.name || categories.find(c => c.id === selectedParent)?.name
                  }
                </div>
              )}
            </div>
          )}

          {/* Lista de categorias existentes */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria criada ainda.
              <br />
              Clique no botão acima para criar sua primeira categoria.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    
    {/* Dialog para editar categoria */}
    {editingCategory && (
      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        categoryType={categoryType}
      />
    )}
    </>
  );
};

export default CategoryManager;