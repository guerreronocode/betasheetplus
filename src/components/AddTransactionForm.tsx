import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Tag, Calendar, Building, Utensils, Car, ShoppingBag, Dog, Film, Book, Smartphone, Shirt, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useUnifiedCategories } from "@/hooks/useUnifiedCategories";
import TransactionFormFields from "./TransactionFormFields";

const expenseCategoriesBase = [
  'Alimentação',
  'Farmácia',
  'Educação',
  'Comer fora',
  'Roupas',
  'Pet',
  'Lazer',
  'Assinaturas e apps',
  'Transporte por app',
  'Compras',
  'Outros'
];

const expenseCategoriesGroupedPredef = [
  {
    title: 'Básicas',
    items: [
      { label: 'Alimentação', value: 'Alimentação', icon: <Utensils className="w-4 h-4 inline mx-1" /> },
      { label: 'Farmácia', value: 'Farmácia', icon: <HeartPulse className="w-4 h-4 inline mx-1" /> },
      { label: 'Educação', value: 'Educação', icon: <Book className="w-4 h-4 inline mx-1" />},
    ],
  },
  {
    title: 'Estilo de Vida',
    items: [
      { label: 'Comer fora', value: 'Comer fora', icon: <Utensils className="w-4 h-4 inline mx-1" /> },
      { label: 'Roupas', value: 'Roupas', icon: <Shirt className="w-4 h-4 inline mx-1" /> },
      { label: 'Pet', value: 'Pet', icon: <Dog className="w-4 h-4 inline mx-1" /> },
      { label: 'Lazer', value: 'Lazer', icon: <Film className="w-4 h-4 inline mx-1" /> },
      { label: 'Assinaturas e apps', value: 'Assinaturas e apps', icon: <Smartphone className="w-4 h-4 inline mx-1" /> },
    ],
  },
  {
    title: 'Extras',
    items: [
      { label: 'Transporte por app', value: 'Transporte por app', icon: <Car className="w-4 h-4 inline mx-1" /> },
      { label: 'Compras', value: 'Compras', icon: <ShoppingBag className="w-4 h-4 inline mx-1" /> },
      { label: 'Outros', value: 'Outros', icon: <Tag className="w-4 h-4 inline mx-1" /> },
    ],
  },
];

const baseIncomeCategories = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Aluguel',
  'Vendas',
  'Outros'
];

const getStoredCustom = (key: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const item = window.localStorage.getItem(key);
    const arr = item ? JSON.parse(item) : [];
    // Verifica se é realmente um array de strings seguro
    if (!Array.isArray(arr)) return [];
    return arr.filter((v) =>
      typeof v === "string" && v.length <= 50 && /^[\w À-ÿ',.-]+$/.test(v) // sanitização básica
    );
  } catch {
    return [];
  }
};

function sanitizeCategory(str: string): string {
  return str.trim().replace(/[^\w À-ÿ',.-]/g, '').slice(0, 50);
}

const AddTransactionForm = () => {
  const { addIncome, addExpense, isAddingIncome, isAddingExpense, bankAccounts } = useFinancialData();
  const { categories: unifiedCategories } = useUnifiedCategories();

  // Usar as categorias unificadas como base para as categorias customizadas
  const incomeCategoriesCfg = useCustomCategories("custom-categories-receita", unifiedCategories.filter(cat => 
    ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Vendas', 'Outros'].includes(cat)
  ));

  const expenseCategoriesCfg = useCustomCategories("custom-categories-despesa", unifiedCategories.filter(cat => 
    !['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Vendas'].includes(cat)
  ));

  const initialIncomeForm = {
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none'
  }
  const initialExpenseForm = {
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none'
  }

  const {
    form: incomeForm,
    handleChange: handleIncomeChange,
    handleSubmit: handleIncomeSubmit,
    isSubmitting: isIncomeSubmitting
  } = useTransactionForm(initialIncomeForm, async (values) => {
    if (!values.description || !values.amount || !values.category) return;
    await addIncome({
      description: values.description,
      amount: parseFloat(values.amount),
      category: values.category,
      date: values.date,
      bank_account_id: values.bank_account_id === 'none' ? undefined : values.bank_account_id
    });
  });

  const {
    form: expenseForm,
    handleChange: handleExpenseChange,
    handleSubmit: handleExpenseSubmit,
    isSubmitting: isExpenseSubmitting
  } = useTransactionForm(initialExpenseForm, async (values) => {
    if (!values.description || !values.amount || !values.category) return;
    await addExpense({
      description: values.description,
      amount: parseFloat(values.amount),
      category: values.category,
      date: values.date,
      bank_account_id: values.bank_account_id === 'none' ? undefined : values.bank_account_id
    });
  });

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Adicionar Transação</h3>
          <p className="text-sm text-gray-600">Registre suas receitas e despesas</p>
        </div>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="text-green-600">Receita</TabsTrigger>
          <TabsTrigger value="expense" className="text-red-600">Despesa</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <TransactionFormFields
              type="income"
              form={incomeForm}
              handleChange={handleIncomeChange}
              categoryConfig={incomeCategoriesCfg}
              bankAccounts={bankAccounts}
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isAddingIncome || isIncomeSubmitting}
            >
              {(isAddingIncome || isIncomeSubmitting) ? "Adicionando..." : "Adicionar Receita"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="expense">
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <TransactionFormFields
              type="expense"
              form={expenseForm}
              handleChange={handleExpenseChange}
              categoryConfig={expenseCategoriesCfg}
              bankAccounts={bankAccounts}
            />
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isAddingExpense || isExpenseSubmitting}
            >
              {(isAddingExpense || isExpenseSubmitting) ? "Adicionando..." : "Adicionar Despesa"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export default AddTransactionForm;
