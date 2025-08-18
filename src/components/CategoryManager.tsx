import React, { useState } from 'react';
import { Plus, Trash2, FolderPlus, Tag, Edit, FolderDown, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<Category | null>(null);
  const [addingMainCategory, setAddingMainCategory] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
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
      parent_id: addingSubcategoryTo?.id || null,
      category_type: categoryType
    });
    
    setNewCategoryName('');
    setAddingSubcategoryTo(null);
    setAddingMainCategory(false);
  };

  const handleAddSubcategory = (parentCategory: Category) => {
    setAddingSubcategoryTo(parentCategory);
    setAddingMainCategory(false);
  };

  const handleAddMainCategory = () => {
    setAddingMainCategory(true);
    setAddingSubcategoryTo(null);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isAddingSubcategoryToThis = addingSubcategoryTo?.id === category.id;
    
    return (
      <div key={category.id} className={`space-y-2 ${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            {level === 0 && hasSubcategories && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategoryExpansion(category.id)}
                className="p-0 h-auto w-auto text-muted-foreground hover:text-primary"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            {level === 0 ? (
              <Tag className="w-4 h-4 text-primary" />
            ) : (
              <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground ml-2" />
            )}
            <Badge variant={level === 0 ? 'default' : 'secondary'}>
              {category.name}
            </Badge>
            {hasSubcategories && (
              <Badge variant="outline" className="text-xs">
                {category.subcategories.length}
              </Badge>
            )}
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
                <FolderDown className="w-4 h-4" />
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
        
        {/* Formulário inline para criar subcategoria */}
        {isAddingSubcategoryToThis && (
          <div className="ml-6 p-3 border border-dashed rounded-lg bg-muted/30">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`subcategoryName-${category.id}`} className="text-sm">
                  Nome da Subcategoria
                </Label>
                <Input
                  id={`subcategoryName-${category.id}`}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Restaurantes, Cinema..."
                  maxLength={50}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreating}
                  size="sm"
                  className="text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Criar
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewCategoryName('');
                    setAddingSubcategoryTo(null);
                  }}
                  className="text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Mostrar subcategorias apenas se expandido */}
        {hasSubcategories && isExpanded && (
          <div className="ml-6 space-y-2">
            {category.subcategories.map(subcat => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
          <div 
            className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-card cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleAddMainCategory}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Adicionar nova categoria
              </span>
            </div>
          </div>

          {/* Formulário para criar nova categoria principal */}
          {addingMainCategory && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-4">
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
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || isCreating}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Categoria
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setNewCategoryName('');
                      setAddingMainCategory(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
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
              {categories.filter(cat => !cat.parent_id).map(category => renderCategory(category))}
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