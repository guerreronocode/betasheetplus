import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Tag, Calendar, Building, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useUnifiedCategories } from "@/hooks/useUnifiedCategories";
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardPurchases } from '@/hooks/useCreditCardPurchases';
import CustomCategoryInput from "./CustomCategoryInput";
import ImprovedTransactionFormFields from "./ImprovedTransactionFormFields";

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
  const { creditCards } = useCreditCards();
  const { createPurchase, isCreating } = useCreditCardPurchases();

  // Usar as categorias unificadas como base para as categorias customizadas
  const incomeCategoriesCfg = useCustomCategories("custom-categories-receita", unifiedCategories.filter(cat => 
    baseIncomeCategories.includes(cat)
  ));

  const expenseCategoriesCfg = useCustomCategories("custom-categories-despesa", unifiedCategories.filter(cat => 
    !baseIncomeCategories.includes(cat)
  ));

  const initialIncomeForm = {
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    bank_account_id: ''
  };

  const initialExpenseForm = {
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_account', // 'bank_account' or 'credit_card'
    bank_account_id: '',
    credit_card_id: '',
    installments: '1',
    installment_value: ''
  };

  const {
    form: incomeForm,
    handleChange: handleIncomeChange,
    handleSubmit: handleIncomeSubmit,
    isSubmitting: isIncomeSubmitting
  } = useTransactionForm(initialIncomeForm, async (values) => {
    if (!values.description || !values.amount || !values.category || !values.bank_account_id) return;
    await addIncome({
      description: values.description,
      amount: parseFloat(values.amount),
      category: values.category,
      date: values.date,
      bank_account_id: values.bank_account_id
    });
    
    // Reset personalizado: manter categoria e conta selecionadas
    handleIncomeChange({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  }, { resetOnSuccess: false }); // NÃO RESETAR AUTOMATICAMENTE

  const {
    form: expenseForm,
    handleChange: handleExpenseChange,
    handleSubmit: handleExpenseSubmit,
    isSubmitting: isExpenseSubmitting,
    resetForm: resetExpenseForm
  } = useTransactionForm(initialExpenseForm, async (values) => {
    console.log('Submitting expense form with values:', values);
    if (!values.description || !values.amount || !values.category) return;
    
    if (values.payment_method === 'credit_card') {
      // Criar compra no cartão de crédito
      if (!values.credit_card_id) return;
      
      const installmentValue = values.installment_value ? parseFloat(values.installment_value) : parseFloat(values.amount) / parseInt(values.installments);
      const totalAmount = installmentValue * parseInt(values.installments);
      
      console.log('Creating credit card purchase...');
      await createPurchase({
        credit_card_id: values.credit_card_id,
        description: values.description,
        amount: totalAmount,
        purchase_date: values.date,
        installments: parseInt(values.installments.toString()),
        category: values.category
      });
    } else {
      // Criar despesa normal
      if (!values.bank_account_id) return;
      console.log('Creating regular expense...');
      await addExpense({
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        date: values.date,
        bank_account_id: values.bank_account_id
      });
    }
    console.log('Expense submitted successfully, resetting only some fields');
    
    // Reset personalizado: manter categorias, método de pagamento e contas selecionadas
    handleExpenseChange({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      installments: '1',
      installment_value: ''
    });
  }, { resetOnSuccess: false }); // NÃO RESETAR AUTOMATICAMENTE

  // Atualizar valor da parcela automaticamente
  useEffect(() => {
    if (expenseForm.amount && expenseForm.installments && expenseForm.payment_method === 'credit_card') {
      const amount = parseFloat(expenseForm.amount);
      const installments = parseInt(expenseForm.installments);
      if (amount > 0 && installments > 0) {
        const installmentValue = (amount / installments).toFixed(2);
        handleExpenseChange({ installment_value: installmentValue });
      }
    }
  }, [expenseForm.amount, expenseForm.installments, expenseForm.payment_method, handleExpenseChange]);

  const renderPaymentMethodFields = () => {
    if (expenseForm.payment_method === 'credit_card') {
      const amount = parseFloat(expenseForm.amount) || 0;
      const installments = parseInt(expenseForm.installments) || 1;
      const installmentValue = parseFloat(expenseForm.installment_value) || 0;
      const totalInstallments = installmentValue * installments;
      const difference = totalInstallments - amount;
      const hasInterest = difference > 0.01;
      const interestPercentage = amount > 0 ? (difference / amount) * 100 : 0;

      return (
        <>
          <div>
            <Label htmlFor="expense-credit-card">Cartão de Crédito *</Label>
            <Select
              value={expenseForm.credit_card_id}
              onValueChange={(value) => handleExpenseChange({ credit_card_id: value })}
              required
            >
              <SelectTrigger>
                <CreditCard className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.length === 0 ? (
                  <SelectItem value="no-cards" disabled>
                    Nenhum cartão cadastrado
                  </SelectItem>
                ) : (
                  creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {creditCards.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Você precisa ter pelo menos um cartão cadastrado para usar esta opção.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="expense-installments">Número de Parcelas</Label>
            <Input
              id="expense-installments"
              type="number"
              min="1"
              max="36"
              value={expenseForm.installments}
              onChange={(e) => handleExpenseChange({ installments: e.target.value })}
              placeholder="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="expense-installment-value">Valor da Parcela</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="expense-installment-value"
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.installment_value}
                onChange={(e) => handleExpenseChange({ installment_value: e.target.value })}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Resumo dos valores */}
          {installments > 0 && installmentValue > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
              <h4 className="font-medium text-sm mb-2">Resumo da Compra</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor da compra:</span>
                <span className="font-medium">R$ {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor da parcela:</span>
                <span className="font-medium">R$ {installmentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total das parcelas:</span>
                <span className="font-medium">R$ {totalInstallments.toFixed(2)}</span>
              </div>
              
              {hasInterest && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">Juros (valor):</span>
                    <span className="font-medium text-amber-600">R$ {difference.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">Juros (%):</span>
                    <span className="font-medium text-amber-600">{interestPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    💰 Você está pagando R$ {difference.toFixed(2)} de juros ({interestPercentage.toFixed(2)}%) sobre o valor da compra.
                  </div>
                </>
              )}
              
              {!hasInterest && Math.abs(difference) < 0.01 && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  ✅ Perfeito! O total das parcelas é igual ao valor da compra.
                </div>
              )}
            </div>
          )}
        </>
      );
    } else {
      return (
        <div>
          <Label htmlFor="expense-bank-account">Conta Bancária *</Label>
          <Select
            value={expenseForm.bank_account_id}
            onValueChange={(value) => handleExpenseChange({ bank_account_id: value })}
            required
          >
            <SelectTrigger>
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
      );
    }
  };

  const isExpenseDisabled = () => {
    if (expenseForm.payment_method === 'credit_card') {
      return isCreating || isExpenseSubmitting || creditCards.length === 0;
    } else {
      return isAddingExpense || isExpenseSubmitting || bankAccounts.length === 0;
    }
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
                onChange={(e) => handleIncomeChange({ description: e.target.value })}
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
                  onChange={(e) => handleIncomeChange({ amount: e.target.value })}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="income-category">Categoria</Label>
              <ImprovedTransactionFormFields
                type="income"
                form={incomeForm}
                handleChange={handleIncomeChange}
              />
            </div>
            <div>
              <Label htmlFor="income-bank-account">Conta Bancária *</Label>
              <Select
                value={incomeForm.bank_account_id}
                onValueChange={(value) => handleIncomeChange({ bank_account_id: value })}
                required
              >
                <SelectTrigger>
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
              <Label htmlFor="income-date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="income-date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => handleIncomeChange({ date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
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
              <Label>Método de Pagamento</Label>
              <RadioGroup
                value={expenseForm.payment_method}
                onValueChange={(value) => handleExpenseChange({ payment_method: value })}
                className="flex flex-col space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_account" id="bank_account" />
                  <Label htmlFor="bank_account" className="flex items-center space-x-2 cursor-pointer">
                    <Building className="w-4 h-4" />
                    <span>Conta Bancária / Dinheiro</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center space-x-2 cursor-pointer">
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {renderPaymentMethodFields()}

            <div>
              <Label htmlFor="expense-date">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => handleExpenseChange({ date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isExpenseDisabled()}
            >
              {(isAddingExpense || isExpenseSubmitting || isCreating) ? "Adicionando..." : "Adicionar Despesa"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default UnifiedTransactionForm;