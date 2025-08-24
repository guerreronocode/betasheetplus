import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BankStatementUpload {
  id: string;
  user_id: string;
  upload_name: string;
  upload_date: string;
  total_transactions: number;
  created_at: string;
  updated_at: string;
}

export interface ParsedTransaction {
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
}

export const useBankStatementUploads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os uploads do usuário
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ['bank_statement_uploads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bank_statement_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      return data as BankStatementUpload[];
    },
    enabled: !!user,
  });

  // Buscar transações de um upload específico
  const getUploadTransactions = async (uploadId: string) => {
    if (!user) return { income: [], expenses: [] };

    const [incomeResponse, expensesResponse] = await Promise.all([
      supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .eq('upload_id', uploadId)
        .order('date', { ascending: false }),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('upload_id', uploadId)
        .order('date', { ascending: false })
    ]);

    if (incomeResponse.error) throw incomeResponse.error;
    if (expensesResponse.error) throw expensesResponse.error;

    return {
      income: incomeResponse.data || [],
      expenses: expensesResponse.data || []
    };
  };

  // Processar arquivo OFX
  const processOFXFile = (fileContent: string): ParsedTransaction[] => {
    const transactions: ParsedTransaction[] = [];
    
    // Extrair todas as transações do arquivo OFX
    const transactionMatches = fileContent.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
    
    if (!transactionMatches) {
      throw new Error('Nenhuma transação encontrada no arquivo OFX');
    }

    transactionMatches.forEach((transactionBlock) => {
      // Extrair valor (TRNAMT)
      const amountMatch = transactionBlock.match(/<TRNAMT>([-]?\d+\.?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      // Extrair data (DTPOSTED) - formato pode variar entre bancos
      const dateMatch = transactionBlock.match(/<DTPOSTED>(\d{8}|\d{14})/);
      let date = '';
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Se for formato YYYYMMDD (8 dígitos) ou YYYYMMDDHHMMSS (14 dígitos)
        if (dateStr.length >= 8) {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          date = `${year}-${month}-${day}`;
        }
      }

      // Extrair nome/descrição (NAME ou MEMO)
      const nameMatch = transactionBlock.match(/<NAME>(.*?)</) || 
                       transactionBlock.match(/<MEMO>(.*?)</);
      const description = nameMatch ? nameMatch[1].trim() : 'Transação sem descrição';

      if (amount !== 0 && date) {
        transactions.push({
          amount: Math.abs(amount),
          date,
          description,
          type: amount > 0 ? 'income' : 'expense'
        });
      }
    });

    return transactions;
  };

  // Mutation para criar upload e processar transações
  const createUploadMutation = useMutation({
    mutationFn: async ({ uploadName, fileContent, bankAccountId }: { 
      uploadName: string; 
      fileContent: string; 
      bankAccountId?: string 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Parse do arquivo OFX
      const parsedTransactions = processOFXFile(fileContent);
      
      if (parsedTransactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo');
      }

      // Criar registro do upload
      const { data: uploadData, error: uploadError } = await supabase
        .from('bank_statement_uploads')
        .insert({
          user_id: user.id,
          upload_name: uploadName,
          total_transactions: parsedTransactions.length
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Inserir transações de receita
      const incomeTransactions = parsedTransactions
        .filter(t => t.type === 'income')
        .map(t => ({
          user_id: user.id,
          amount: t.amount,
          date: t.date,
          description: t.description,
          category: 'Upload extrato bancário',
          bank_account_id: bankAccountId || null,
          upload_id: uploadData.id
        }));

      if (incomeTransactions.length > 0) {
        const { error: incomeError } = await supabase
          .from('income')
          .insert(incomeTransactions);
        
        if (incomeError) throw incomeError;
      }

      // Inserir transações de despesa
      const expenseTransactions = parsedTransactions
        .filter(t => t.type === 'expense')
        .map(t => ({
          user_id: user.id,
          amount: t.amount,
          date: t.date,
          description: t.description,
          category: 'Upload extrato bancário',
          bank_account_id: bankAccountId || null,
          upload_id: uploadData.id
        }));

      if (expenseTransactions.length > 0) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert(expenseTransactions);
        
        if (expenseError) throw expenseError;
      }

      return {
        upload: uploadData,
        transactionsCount: parsedTransactions.length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank_statement_uploads'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
      toast({
        title: 'Upload processado com sucesso!',
        description: `${data.transactionsCount} transações foram importadas do extrato "${data.upload.upload_name}".`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao processar upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    uploads,
    isLoading,
    getUploadTransactions,
    createUpload: createUploadMutation.mutate,
    isCreatingUpload: createUploadMutation.isPending
  };
};