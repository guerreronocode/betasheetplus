import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHierarchicalCategories } from '@/hooks/useHierarchicalCategories';
import CategoryManager from '../CategoryManager';

interface HierarchicalCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categoryType: 'expense' | 'income';
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({
  value,
  onChange,
  categoryType,
  placeholder = "Escolha uma categoria",
  required,
  className
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const { categoryOptions, isLoading } = useHierarchicalCategories(categoryType);

  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: typeof categoryOptions } = {
      main: [],
      subcategories: []
    };

    categoryOptions.forEach(option => {
      if (option.parent) {
        groups.subcategories.push(option);
      } else {
        groups.main.push(option);
      }
    });

    return groups;
  }, [categoryOptions]);

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange} required={required} disabled={isLoading}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {/* Categorias principais */}
            {groupedOptions.main.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-md mx-1 my-1">
                  Categorias Principais
                </div>
                {groupedOptions.main.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </>
            )}

            {/* Sub-categorias */}
            {groupedOptions.subcategories.length > 0 && (
              <>
                {groupedOptions.main.length > 0 && (
                  <div className="border-t my-1" />
                )}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-md mx-1 my-1">
                  Sub-categorias
                </div>
                {groupedOptions.subcategories.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="text-muted-foreground">→</span> {option.label}
                  </SelectItem>
                ))}
              </>
            )}

            {categoryOptions.length === 0 && !isLoading && (
              <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                Nenhuma categoria encontrada
              </div>
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