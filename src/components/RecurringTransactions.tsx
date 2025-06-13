
import React, { useState } from 'react';
import { Calendar, Repeat, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';

const RecurringTransactions = () => {
  const { recurringTransactions, addRecurringTransaction, isAddingRecurring } = useRecurringTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'income' as 'income' | 'expense',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Vendas', 'Outros'];
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Entretenimento', 'Compras', 'Outros'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) return;
    
    addRecurringTransaction({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      frequency: form.frequency,
      start_date: form.start_date,
      end_date: form.end_date || null
    });
    
    setForm({
      description: '',
      amount: '',
      category: '',
      type: 'income',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
    
    setIsDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Repeat className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transações Recorrentes</h3>
            <p className="text-sm text-gray-600">Configure receitas e despesas automáticas</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação Recorrente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: 'income' | 'expense') => setForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Salário mensal"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setForm(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Data de Fim (opcional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isAddingRecurring}>
                {isAddingRecurring ? 'Adicionando...' : 'Criar Transação Recorrente'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma transação recorrente configurada</p>
            <p className="text-sm">Configure receitas e despesas automáticas!</p>
          </div>
        ) : (
          recurringTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Calendar className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{getFrequencyLabel(transaction.frequency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  Desde {new Date(transaction.start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecurringTransactions;
