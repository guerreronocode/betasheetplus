import React, { useState } from 'react';
import { Calendar, Repeat, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HierarchicalCategorySelector from '@/components/shared/HierarchicalCategorySelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRecurringTransactions, RecurringTransaction } from '@/hooks/useRecurringTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { toast } from '@/hooks/use-toast';

const RecurringTransactions = () => {
  const { 
    recurringTransactions, 
    addRecurringTransaction, 
    updateRecurringTransaction,
    deleteRecurringTransaction,
    isAddingRecurring,
    isUpdatingRecurring,
    isDeletingRecurring
  } = useRecurringTransactions();
  
  const { bankAccounts } = useBankAccounts();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [showRetroactiveDialog, setShowRetroactiveDialog] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'income' as 'income' | 'expense',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    bank_account_id: ''
  });

  const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Vendas', 'Outros'];
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Entretenimento', 'Compras', 'Outros'];

  const isRetroactive = () => {
    const startDate = new Date(form.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return startDate < today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category || !form.bank_account_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios, incluindo a conta bancária.',
        variant: 'destructive'
      });
      return;
    }
    
    if (bankAccounts.length === 0) {
      toast({
        title: 'Conta bancária necessária',
        description: 'Você precisa ter pelo menos uma conta bancária cadastrada.',
        variant: 'destructive'
      });
      return;
    }
    
    const transactionData = {
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      frequency: form.frequency,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      bank_account_id: form.bank_account_id
    };

    if (editingTransaction) {
      // Editando transação existente
      updateRecurringTransaction({
        id: editingTransaction.id,
        updates: transactionData
      });
      setEditingTransaction(null);
    } else {
      // Nova transação
      if (isRetroactive()) {
        setPendingTransaction(transactionData);
        setShowRetroactiveDialog(true);
        return;
      }
      
      addRecurringTransaction({
        transaction: transactionData,
        generateRetroactive: false
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleRetroactiveChoice = (generateRetroactive: boolean) => {
    if (pendingTransaction) {
      addRecurringTransaction({
        transaction: pendingTransaction,
        generateRetroactive
      });
    }
    
    setShowRetroactiveDialog(false);
    setPendingTransaction(null);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setForm({
      description: '',
      amount: '',
      category: '',
      type: 'income',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      bank_account_id: ''
    });
  };

  const openEditDialog = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setForm({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || '',
      bank_account_id: transaction.bank_account_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteRecurringTransaction(id);
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
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Repeat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Transações Recorrentes</h3>
              <p className="text-sm text-muted-foreground">Configure receitas e despesas automáticas</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTransaction(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente'}
                </DialogTitle>
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
                  <HierarchicalCategorySelector
                    value={form.category}
                    onChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                    placeholder="Selecione uma categoria"
                    required
                  />
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
                
                <div>
                  <Label htmlFor="bank_account_id">Conta Bancária *</Label>
                  <Select
                    value={form.bank_account_id}
                    onValueChange={(value) => setForm(prev => ({ ...prev, bank_account_id: value }))}
                    required
                  >
                    <SelectTrigger>
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
                      Você precisa ter pelo menos uma conta bancária cadastrada.
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isAddingRecurring || isUpdatingRecurring || bankAccounts.length === 0}>
                  {isAddingRecurring || isUpdatingRecurring 
                    ? (editingTransaction ? 'Atualizando...' : 'Adicionando...') 
                    : (editingTransaction ? 'Atualizar Transação' : 'Criar Transação Recorrente')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {recurringTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação recorrente configurada</p>
              <p className="text-sm">Configure receitas e despesas automáticas!</p>
            </div>
          ) : (
            recurringTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    <Calendar className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{getFrequencyLabel(transaction.frequency)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right mr-2">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Desde {new Date(transaction.start_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(transaction)}
                    disabled={isUpdatingRecurring}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeletingRecurring}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Transação Recorrente</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{transaction.description}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Dialog para lançamentos retroativos */}
      <AlertDialog open={showRetroactiveDialog} onOpenChange={setShowRetroactiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Lançamentos Retroativos
            </AlertDialogTitle>
            <AlertDialogDescription>
              A data de início selecionada é anterior ao dia de hoje. Deseja adicionar os lançamentos retroativos a partir da data de início informada?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleRetroactiveChoice(false)}>
              Não, iniciar do próximo período
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRetroactiveChoice(true)}>
              Sim, adicionar retroativos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecurringTransactions;