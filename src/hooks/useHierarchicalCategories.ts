import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type UserCategoryInsert = Database['public']['Tables']['user_categories']['Insert'];
type UserCategoryRow = Database['public']['Tables']['user_categories']['Row'];

export interface Category extends UserCategoryRow {
  subcategories?: Category[];
}

export interface CategoryOption {
  value: string;
  label: string;
  parent?: string;
}

const defaultExpenseCategories = [
  'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 
  'Casa', 'Roupas', 'Tecnologia', 'Viagem', 'Outros'
];

const defaultIncomeCategories = [
  'Salário', 'Freelance', 'Investimentos', 'Renda Extra', 'Outros'
];

export const useHierarchicalCategories = (categoryType: 'expense' | 'income' | 'both' = 'expense') => {
  const queryClient = useQueryClient();

  // Buscar categorias do usuário
  const { data: userCategories = [], isLoading } = useQuery({
    queryKey: ['hierarchical-categories', categoryType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .in('category_type', categoryType === 'both' ? ['expense', 'income', 'both'] : [categoryType, 'both'])
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });

  // Buscar categorias das transações existentes
  const { data: existingCategories = [] } = useQuery({
    queryKey: ['existing-categories', categoryType],
    queryFn: async () => {
      if (categoryType === 'income') {
        const { data, error } = await supabase
          .from('income')
          .select('category')
          .order('category');
        if (error) throw error;
        return [...new Set(data.map(item => item.category))].filter(Boolean);
      } else {
        const [expensesResult, purchasesResult] = await Promise.all([
          supabase.from('expenses').select('category').order('category'),
          supabase.from('credit_card_purchases').select('category').order('category')
        ]);

        if (expensesResult.error) throw expensesResult.error;
        if (purchasesResult.error) throw purchasesResult.error;

        const allCategories = [
          ...expensesResult.data.map(item => item.category),
          ...purchasesResult.data.map(item => item.category)
        ];
        return [...new Set(allCategories)].filter(Boolean);
      }
    },
  });

  // Criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, parent_id, category_type }: { name: string; parent_id?: string | null; category_type: string }) => {
      const insertData: UserCategoryInsert = {
        name,
        parent_id: parent_id || null,
        category_type,
        user_id: (await supabase.auth.getUser()).data.user?.id!
      };

      const { data, error } = await supabase
        .from('user_categories')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: any) => {
      if (error.message?.includes('unique constraint')) {
        toast.error('Esta categoria já existe!');
      } else if (error.message?.includes('Sub-categorias não podem ter sub-categorias')) {
        toast.error('Sub-categorias não podem ter sub-categorias');
      } else {
        toast.error('Erro ao criar categoria');
      }
    },
  });

  // Deletar categoria
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-categories'] });
      toast.success('Categoria removida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover categoria');
    },
  });

  // Organizar categorias em estrutura hierárquica
  const organizeCategories = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Primeiro, criar um mapa de todas as categorias
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] });
    });

    // Depois, organizar a hierarquia
    categories.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories!.push(categoryMap.get(cat.id)!);
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id)!);
      }
    });

    return rootCategories;
  };

  const getCategoryOptions = (): CategoryOption[] => {
    const organized = organizeCategories(userCategories);
    const options: CategoryOption[] = [];

    // Adicionar categorias padrão que não foram customizadas
    const defaultCategories = categoryType === 'income' ? defaultIncomeCategories : defaultExpenseCategories;
    const userCategoryNames = userCategories.map(cat => cat.name);
    const existingCategoryNames = existingCategories || [];

    // Combinar categorias padrão, existentes e personalizadas
    const allDefaultAndExisting = [...new Set([...defaultCategories, ...existingCategoryNames])];
    
    allDefaultAndExisting.forEach(catName => {
      if (!userCategoryNames.includes(catName)) {
        options.push({ value: catName, label: catName });
      }
    });

    // Adicionar categorias personalizadas hierárquicas
    organized.forEach(cat => {
      options.push({ value: cat.name, label: cat.name });
      cat.subcategories?.forEach(subcat => {
        options.push({ 
          value: subcat.name, 
          label: `${cat.name} > ${subcat.name}`,
          parent: cat.name
        });
      });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  return {
    categories: organizeCategories(userCategories),
    categoryOptions: getCategoryOptions(),
    createCategory: createCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isLoading,
    isCreating: createCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};