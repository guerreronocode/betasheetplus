import React, { useState } from 'react';
import { Plus, Trash2, FolderPlus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useHierarchicalCategories, Category } from '@/hooks/useHierarchicalCategories';

interface CategoryManagerProps {
  categoryType: 'expense' | 'income';
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categoryType }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string>('');
  
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
      parent_id: selectedParent || null,
      category_type: categoryType
    });
    
    setNewCategoryName('');
    setSelectedParent('');
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteCategory(category.id)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      {category.subcategories?.map(subcat => renderCategory(subcat, level + 1))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderPlus className="w-5 h-5" />
          Gerenciar Categorias de {categoryType === 'expense' ? 'Despesas' : 'Receitas'}
        </CardTitle>
        <CardDescription>
          Organize suas categorias com até 2 níveis de hierarquia (categoria {'->'} sub-categoria)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário para criar nova categoria */}
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentCategory">Categoria Pai (opcional)</Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Criar como categoria principal" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || isCreating}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedParent ? 'Criar Sub-categoria' : 'Criar Categoria'}
              </Button>
            </div>
          </div>
          
          {selectedParent && (
            <div className="text-sm text-muted-foreground">
          <strong>Criando sub-categoria de:</strong> {categories.find(c => c.id === selectedParent)?.name}
            </div>
          )}
        </div>

        {/* Lista de categorias */}
        <div className="space-y-3">
          <h3 className="font-medium">Suas Categorias Personalizadas</h3>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria personalizada criada ainda.
              <br />
              Use o formulário acima para criar suas primeiras categorias.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;