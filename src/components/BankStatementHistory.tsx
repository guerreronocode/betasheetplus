import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Eye, Calendar, Hash } from 'lucide-react';
import { useBankStatementUploads } from '@/hooks/useBankStatementUploads';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BankStatementHistory = () => {
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null);
  const [uploadTransactions, setUploadTransactions] = useState<{
    income: any[];
    expenses: any[];
  } | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const { uploads, isLoading, getUploadTransactions } = useBankStatementUploads();

  const handleViewDetails = async (uploadId: string) => {
    setSelectedUpload(uploadId);
    setIsLoadingTransactions(true);
    
    try {
      const transactions = await getUploadTransactions(uploadId);
      setUploadTransactions(transactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const selectedUploadData = selectedUpload 
    ? uploads.find(u => u.id === selectedUpload)
    : null;

  const allTransactions = uploadTransactions 
    ? [
        ...uploadTransactions.income.map(t => ({ ...t, type: 'income' as const })),
        ...uploadTransactions.expenses.map(t => ({ ...t, type: 'expense' as const }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Histórico de Uploads</h3>
        </div>

        {uploads.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">Nenhum upload realizado ainda</p>
            <p className="text-sm text-muted-foreground">
              Faça o upload de um extrato bancário OFX para começar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{upload.upload_name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(upload.upload_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      {upload.total_transactions} transações
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {upload.total_transactions} transações
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(upload.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!selectedUpload} onOpenChange={() => setSelectedUpload(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedUploadData?.upload_name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Uploaded em {selectedUploadData ? formatDate(selectedUploadData.upload_date) : ''}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Carregando transações...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  allTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${
                            transaction.type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                          </span>
                          <span className="font-medium">{transaction.description}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BankStatementHistory;