
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardBills } from '@/hooks/useCreditCardBills';
import { CreditCardForm } from './CreditCardForm';
import { CreditCardList } from './CreditCardList';
import { PurchaseForm } from './PurchaseForm';
import { BillsList } from './BillsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';

export const CreditCardManager: React.FC = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  
  const { creditCards, isLoading: cardsLoading } = useCreditCards();
  const { upcomingBills, overdueBills } = useCreditCardBills();

  const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalOverdue = overdueBills.reduce((sum, bill) => sum + bill.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditCards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Faturas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUpcoming)}</div>
            <p className="text-xs text-muted-foreground">{upcomingBills.length} faturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas em Atraso</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">{overdueBills.length} faturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Cartões</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="bills">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Meus Cartões</h3>
            <Button onClick={() => setShowCardForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cartão
            </Button>
          </div>

          {showCardForm && (
            <CreditCardForm onClose={() => setShowCardForm(false)} />
          )}

          <CreditCardList />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registrar Compra</h3>
            <Button 
              onClick={() => setShowPurchaseForm(true)}
              disabled={creditCards.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </div>

          {creditCards.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Você precisa cadastrar um cartão de crédito primeiro.
                </p>
              </CardContent>
            </Card>
          )}

          {showPurchaseForm && (
            <PurchaseForm onClose={() => setShowPurchaseForm(false)} />
          )}
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Faturas</h3>
          </div>

          <BillsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
