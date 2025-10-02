import React, { useState } from 'react';
import { DollarSign, Tag, Calendar, Building, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useUnifiedCategories } from "@/hooks/useUnifiedCategories";
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';
import { formatDateForDatabase, getTodayForInput } from "@/utils/formatters";
import { addMonths, differenceInMonths, startOfMonth, format, isFuture, startOfDay } from 'date-fns';
import ImprovedTransactionFormFields from "./ImprovedTransactionFormFields";
import { useToast } from '@/hooks/use-toast';

const baseIncomeCategories = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Aluguel',
  'Vendas',
  'Outros'
];

const UnifiedTransactionForm = () => {
  const { addIncome, addExpense, isAddingIncome, isAddingExpense, bankAccounts } = useFinancialData();
  const { categories: unifiedCategories } = useUnifiedCategories();
  const { createPlannedIncome } = usePlannedIncome();
  const { createPlannedExpense } = usePlannedExpenses();

  // Usar as categorias unificadas como base para as categorias customizadas
  const incomeCategoriesCfg = useCustomCategories("custom-categories-receita", unifiedCategories.filter(cat => 
    baseIncomeCategories.includes(cat)
  ));

  const expenseCategoriesCfg = useCustomCategories("custom-categories-despesa", unifiedCategories.filter(cat => 
    !baseIncomeCategories.includes(cat)
  ));

  const { toast } = useToast();

  const initialIncomeForm = {
    description: '',
    amount: '',
    category: '',
    date: getTodayForInput(),
    bank_account_id: '',
    isRecurring: false,
    endMonthYear: ''
  };

  const initialExpenseForm = {
    description: '',
    amount: '',
    category: '',
    date: getTodayForInput(),
    bank_account_id: '',
    isRecurring: false,
    endMonthYear: ''
  };

  const {
    form: incomeForm,
    handleChange: handleIncomeChange,
    handleSubmit: handleIncomeSubmit,
    isSubmitting: isIncomeSubmitting
  } = useTransactionForm(initialIncomeForm, async (values) => {
    if (!values.description || !values.amount || !values.category || !values.bank_account_id) return;
    
    const amount = parseFloat(values.amount);
    const today = startOfDay(new Date());
    let installments = 1;
    
    // Calcular número de parcelas se for recorrente
    if (values.isRecurring && values.endMonthYear) {
      const startDate = startOfMonth(new Date(values.date));
      const [year, month] = values.endMonthYear.split('-').map(Number);
      const endDate = startOfMonth(new Date(year, month - 1));
      installments = differenceInMonths(endDate, startDate) + 1;
    }
    
    // Criar múltiplas transações se for recorrente
    for (let i = 0; i < installments; i++) {
      const transactionDate = addMonths(new Date(values.date), i);
      const dateStr = format(transactionDate, 'yyyy-MM-dd');
      const isFutureDate = isFuture(startOfDay(transactionDate));
      
      const description = installments > 1 
        ? `${values.description} (${i + 1}/${installments})`
        : values.description;
      
      if (isFutureDate) {
        // Transação futura → planned_income (pendência)
        createPlannedIncome({
          description,
          planned_amount: amount,
          category: values.category,
          month: dateStr,
          is_recurring: false,
        });
        console.log(`✅ [PENDÊNCIA] Tipo: receita - Data: ${dateStr} - Descrição: ${description}`);
      } else {
        // Transação presente/passada → income (efetivada)
        await addIncome({
          description,
          amount,
          category: values.category,
          date: formatDateForDatabase(dateStr),
          bank_account_id: values.bank_account_id
        });
        console.log(`✅ [EFETIVADA] Tipo: receita - Data: ${dateStr} - Descrição: ${description}`);
      }
    }
    
    // Exibir apenas 1 toast para transações recorrentes
    if (values.isRecurring) {
      toast({ title: 'Transação recorrente adicionada com sucesso!' });
    }
    
    // Reset personalizado: manter categoria e conta selecionadas
    handleIncomeChange({
      description: '',
      amount: '',
      date: getTodayForInput(),
      isRecurring: false,
      endMonthYear: ''
    });
  }, { resetOnSuccess: false });

  const {
    form: expenseForm,
    handleChange: handleExpenseChange,
    handleSubmit: handleExpenseSubmit,
    isSubmitting: isExpenseSubmitting,
    resetForm: resetExpenseForm
  } = useTransactionForm(initialExpenseForm, async (values) => {
    if (!values.description || !values.amount || !values.category || !values.bank_account_id) return;
    
    const amount = parseFloat(values.amount);
    const today = startOfDay(new Date());
    let installments = 1;
    
    // Calcular número de parcelas se for recorrente
    if (values.isRecurring && values.endMonthYear) {
      const startDate = startOfMonth(new Date(values.date));
      const [year, month] = values.endMonthYear.split('-').map(Number);
      const endDate = startOfMonth(new Date(year, month - 1));
      installments = differenceInMonths(endDate, startDate) + 1;
    }
    
    // Criar múltiplas transações se for recorrente
    for (let i = 0; i < installments; i++) {
      const transactionDate = addMonths(new Date(values.date), i);
      const dateStr = format(transactionDate, 'yyyy-MM-dd');
      const isFutureDate = isFuture(startOfDay(transactionDate));
      
      const description = installments > 1 
        ? `${values.description} (${i + 1}/${installments})`
        : values.description;
      
      if (isFutureDate) {
        // Transação futura → planned_expenses (pendência)
        createPlannedExpense({
          description,
          planned_amount: amount,
          category: values.category,
          month: dateStr,
          is_recurring: false,
        });
        console.log(`✅ [PENDÊNCIA] Tipo: despesa - Data: ${dateStr} - Descrição: ${description}`);
      } else {
        // Transação presente/passada → expenses (efetivada)
        await addExpense({
          description,
          amount,
          category: values.category,
          date: formatDateForDatabase(dateStr),
          bank_account_id: values.bank_account_id
        });
        console.log(`✅ [EFETIVADA] Tipo: despesa - Data: ${dateStr} - Descrição: ${description}`);
      }
    }
    
    // Exibir apenas 1 toast para transações recorrentes
    if (values.isRecurring) {
      toast({ title: 'Transação recorrente adicionada com sucesso!' });
    }
    
    // Reset personalizado: manter categoria e conta selecionadas
    handleExpenseChange({
      description: '',
      amount: '',
      date: getTodayForInput(),
      isRecurring: false,
      endMonthYear: ''
    });
  }, { resetOnSuccess: false });




  return (
    <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="text-green-600">Receita</TabsTrigger>
          <TabsTrigger value="expense" className="text-red-600">Despesa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <form onSubmit={handleIncomeSubmit} className="space-y-3">
            <div>
              <Label htmlFor="income-description" className="text-xs">Descrição</Label>
              <Input
                id="income-description"
                value={incomeForm.description}
                onChange={(e) => handleIncomeChange({ description: e.target.value })}
                placeholder="Ex: Salário de janeiro"
                className="h-8"
                required
              />
            </div>
            <div>
              <Label htmlFor="income-amount" className="text-xs">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                <Input
                  id="income-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={incomeForm.amount}
                  onChange={(e) => handleIncomeChange({ amount: e.target.value })}
                  placeholder="0.00"
                  className="pl-10 h-8"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="income-category" className="text-xs">Categoria</Label>
              <ImprovedTransactionFormFields
                type="income"
                form={incomeForm}
                handleChange={handleIncomeChange}
              />
            </div>
            <div>
              <Label htmlFor="income-recurring" className="text-xs">Opções</Label>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="income-recurring"
                  checked={incomeForm.isRecurring}
                  onCheckedChange={(checked) => handleIncomeChange({ isRecurring: !!checked })}
                  className="fnb-checkbox-circular"
                />
                <Label htmlFor="income-recurring" className="text-xs flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Receita recorrente
                </Label>
              </div>
              {incomeForm.isRecurring && (
                <div className="mt-2">
                  <Label htmlFor="income-end-month" className="text-xs">Até que mês/ano?</Label>
                  <Input
                    id="income-end-month"
                    type="month"
                    value={incomeForm.endMonthYear}
                    onChange={(e) => handleIncomeChange({ endMonthYear: e.target.value })}
                    min={format(new Date(incomeForm.date), 'yyyy-MM')}
                    className="h-8 mt-1"
                    required
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="income-bank-account" className="text-xs">Instituição Financeira *</Label>
              <Select
                value={incomeForm.bank_account_id}
                onValueChange={(value) => handleIncomeChange({ bank_account_id: value })}
                required
              >
                <SelectTrigger className="h-8">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      Nenhuma conta cadastrada
                    </SelectItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.name} - {account.bank_name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {bankAccounts.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Você precisa ter pelo menos uma conta bancária cadastrada para registrar transações.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="income-date" className="text-xs">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                <Input
                  id="income-date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => handleIncomeChange({ date: e.target.value })}
                  className="pl-10 h-8"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 h-8 mt-4"
              disabled={isAddingIncome || isIncomeSubmitting || bankAccounts.length === 0}
            >
              {(isAddingIncome || isIncomeSubmitting) ? "Adicionando..." : "Adicionar Receita"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="expense">
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <Label htmlFor="expense-description">Descrição</Label>
              <Input
                id="expense-description"
                value={expenseForm.description}
                onChange={(e) => handleExpenseChange({ description: e.target.value })}
                placeholder="Ex: Compras no supermercado"
                required
              />
            </div>
            <div>
              <Label htmlFor="expense-amount">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => handleExpenseChange({ amount: e.target.value })}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expense-category">Categoria</Label>
              <ImprovedTransactionFormFields
                type="expense"
                form={expenseForm}
                handleChange={handleExpenseChange}
              />
            </div>
            <div>
              <Label htmlFor="expense-recurring" className="text-xs">Opções</Label>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="expense-recurring"
                  checked={expenseForm.isRecurring}
                  onCheckedChange={(checked) => handleExpenseChange({ isRecurring: !!checked })}
                  className="fnb-checkbox-circular"
                />
                <Label htmlFor="expense-recurring" className="text-xs flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Despesa recorrente
                </Label>
              </div>
              {expenseForm.isRecurring && (
                <div className="mt-2">
                  <Label htmlFor="expense-end-month" className="text-xs">Até que mês/ano?</Label>
                  <Input
                    id="expense-end-month"
                    type="month"
                    value={expenseForm.endMonthYear}
                    onChange={(e) => handleExpenseChange({ endMonthYear: e.target.value })}
                    min={format(new Date(expenseForm.date), 'yyyy-MM')}
                    className="h-8 mt-1"
                    required
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="expense-bank-account" className="text-xs">Instituição Financeira *</Label>
              <Select
                value={expenseForm.bank_account_id}
                onValueChange={(value) => handleExpenseChange({ bank_account_id: value })}
                required
              >
                <SelectTrigger className="h-8">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      Nenhuma conta cadastrada
                    </SelectItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.name} - {account.bank_name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {bankAccounts.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Você precisa ter pelo menos uma conta bancária cadastrada para usar esta opção.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expense-date" className="text-xs">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => handleExpenseChange({ date: e.target.value })}
                  className="pl-10 h-8"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 h-8 mt-4"
              disabled={isAddingExpense || isExpenseSubmitting || bankAccounts.length === 0}
            >
              {(isAddingExpense || isExpenseSubmitting) ? "Adicionando..." : "Adicionar Despesa"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
  );
};

export default UnifiedTransactionForm;