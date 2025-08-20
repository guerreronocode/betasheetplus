import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHierarchicalCategories } from '@/hooks/useHierarchicalCategories';
import CategoryManager from '../CategoryManager';

interface HierarchicalCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  categoryType?: 'income' | 'expense';
}

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({
  value,
  onChange,
  placeholder = "Escolha uma categoria",
  required,
  className,
  categoryType = 'expense'
}) => {
  console.log('🔍 HierarchicalCategorySelector RENDER:', {
    value,
    categoryType,
    placeholder,
    required
  });

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { categoryOptions, isLoading } = useHierarchicalCategories(categoryType);

  console.log('📋 HierarchicalCategorySelector - categoryOptions:', {
    categoryOptions: categoryOptions.map(c => ({ value: c.value, label: c.label, parent: c.parent })),
    isLoading,
    totalOptions: categoryOptions.length
  });

  // Verificar se a categoria atual existe nas opções
  const currentCategoryExists = categoryOptions.find(option => option.value === value);
  console.log('✅ HierarchicalCategorySelector - categoria atual:', {
    value,
    exists: !!currentCategoryExists,
    categoryDetails: currentCategoryExists
  });

  const groupedOptions = React.useMemo(() => {
    console.log('🔄 HierarchicalCategorySelector - criando grupos com:', categoryOptions.length, 'opções');
    
    const groups: { [key: string]: { main: typeof categoryOptions[0] | null, subcategories: typeof categoryOptions } } = {};

    categoryOptions.forEach(option => {
      if (option.parent) {
        if (!groups[option.parent]) {
          groups[option.parent] = { main: null, subcategories: [] };
        }
        groups[option.parent].subcategories.push(option);
      } else {
        if (!groups[option.value]) {
          groups[option.value] = { main: option, subcategories: [] };
        } else {
          groups[option.value].main = option;
        }
      }
    });

    console.log('📊 HierarchicalCategorySelector - grupos criados:', Object.keys(groups).map(key => ({
      key,
      hasMain: !!groups[key].main,
      subcategoriesCount: groups[key].subcategories.length
    })));

    return groups;
  }, [categoryOptions]);

  const toggleCategoryExpansion = (categoryValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryValue)) {
        newSet.delete(categoryValue);
      } else {
        newSet.add(categoryValue);
      }
      return newSet;
    });
  };

  const renderCategoryItem = (groupKey: string, group: typeof groupedOptions[string]) => {
    const hasSubcategories = group.subcategories.length > 0;
    const isExpanded = expandedCategories.has(groupKey);
    
    return (
      <div key={groupKey}>
        {/* Categoria principal */}
        {group.main && (
          <div className="relative">
            <SelectItem value={group.main.value} className="pr-8">
              <span>{group.main.label}</span>
            </SelectItem>
            {hasSubcategories && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleCategoryExpansion(groupKey, e);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-accent hover:text-accent-foreground rounded p-1 transition-colors z-10"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )}
        
        {/* Subcategorias (mostradas apenas se expandidas) */}
        {hasSubcategories && isExpanded && (
          <div className="pl-4">
            {group.subcategories.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">└</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Garantir que o valor só seja definido se a categoria existir nas opções ou se não houver valor
  const selectValue = value && currentCategoryExists ? value : "";
  
  console.log('🎯 HierarchicalCategorySelector - valor final do Select:', {
    originalValue: value,
    categoryExists: !!currentCategoryExists,
    finalSelectValue: selectValue,
    isLoading
  });

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select 
          value={selectValue} 
          onValueChange={(newValue) => {
            console.log('🔄 HierarchicalCategorySelector - onChange:', { from: value, to: newValue });
            onChange(newValue);
          }} 
          required={required} 
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-80 z-50 bg-popover border">
            {Object.keys(groupedOptions).length === 0 && !isLoading && (
              <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                Nenhuma categoria encontrada
              </div>
            )}
            
            {Object.entries(groupedOptions).map(([groupKey, group]) => 
              renderCategoryItem(groupKey, group)
            )}
          </SelectContent>
        </Select>

        <Dialog open={isManagerOpen} onOpenChange={setIsManagerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Gerenciar categorias">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Categorias</DialogTitle>
            </DialogHeader>
            <CategoryManager categoryType={categoryType} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HierarchicalCategorySelector;