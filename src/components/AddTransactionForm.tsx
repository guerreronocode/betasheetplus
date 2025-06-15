import React, { useState } from 'react';
import { Plus, DollarSign, Tag, Calendar, Building, Utensils, Car, ShoppingBag, Dog, Film, Book, Smartphone, Shirt, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialData } from '@/hooks/useFinancialData';

const expenseCategoriesGrouped = [
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

const incomeCategories = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Aluguel',
  'Vendas',
  'Outros'
];

const AddTransactionForm = () => {
  const { addIncome, addExpense, isAddingIncome, isAddingExpense, bankAccounts } = useFinancialData();
  
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none'
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none'
  });

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.description || !incomeForm.amount || !incomeForm.category) return;
    
    addIncome({
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      category: incomeForm.category,
      date: incomeForm.date,
      bank_account_id: incomeForm.bank_account_id === 'none' ? undefined : incomeForm.bank_account_id
    });
    
    setIncomeForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      bank_account_id: 'none'
    });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category) return;
    
    addExpense({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      bank_account_id: expenseForm.bank_account_id === 'none' ? undefined : expenseForm.bank_account_id
    });
    
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      bank_account_id: 'none'
    });
  };

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
            <div>
              <Label htmlFor="income-description">Descrição</Label>
              <Input
                id="income-description"
                value={incomeForm.description}
                onChange={(e) => setIncomeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Salário de janeiro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="income-amount">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="income-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="income-category">Categoria</Label>
              <Select
                value={incomeForm.category}
                onValueChange={(value) => setIncomeForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="income-bank-account">Conta Bancária</Label>
              <Select
                value={incomeForm.bank_account_id}
                onValueChange={(value) => setIncomeForm(prev => ({ ...prev, bank_account_id: value }))}
              >
                <SelectTrigger>
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecione uma conta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma conta específica</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        <span>{account.name} - {account.bank_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="income-date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="income-date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isAddingIncome}>
              {isAddingIncome ? 'Adicionando...' : 'Adicionar Receita'}
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
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
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
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="expense-category">Categoria</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategoriesGrouped.map(group => (
                    <React.Fragment key={group.title}>
                      <div className="text-xs font-semibold px-2 py-1 text-gray-400">{group.title}</div>
                      {group.items.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.icon}{category.label}
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expense-bank-account">Conta Bancária</Label>
              <Select
                value={expenseForm.bank_account_id}
                onValueChange={(value) => setExpenseForm(prev => ({ ...prev, bank_account_id: value }))}
              >
                <SelectTrigger>
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecione uma conta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma conta específica</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        <span>{account.name} - {account.bank_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="expense-date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isAddingExpense}>
              {isAddingExpense ? 'Adicionando...' : 'Adicionar Despesa'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AddTransactionForm;
