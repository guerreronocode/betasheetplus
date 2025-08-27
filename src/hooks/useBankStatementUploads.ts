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

  // Mutation para criar upload e processar transações com substituição segura
  const createUploadMutation = useMutation({
    mutationFn: async ({ uploadName, fileContent, bankAccountId }: { 
      uploadName: string; 
      fileContent: string; 
      bankAccountId: string 
    }) => {
      if (!user) throw new Error('User not authenticated');
      if (!bankAccountId) throw new Error('Conta bancária é obrigatória');

      // Parse do arquivo OFX
      const parsedTransactions = processOFXFile(fileContent);
      
      if (parsedTransactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo');
      }

      // Determinar período do extrato (data mais antiga e mais recente)
      const dates = parsedTransactions.map(t => t.date).sort();
      const periodStart = dates[0];
      const periodEnd = dates[dates.length - 1];

      // Executar todas as operações dentro de uma transação RPC
      const { data: result, error: rpcError } = await supabase.rpc('process_bank_statement_upload' as any, {
        p_user_id: user.id,
        p_upload_name: uploadName,
        p_bank_account_id: bankAccountId,
        p_period_start: periodStart,
        p_period_end: periodEnd,
        p_transactions: parsedTransactions
      });

      if (rpcError) {
        throw new Error(`Erro ao processar upload: ${rpcError.message}`);
      }

      return result as { uploadId: string; transactionsCount: number; balanceImpact: number; success: boolean };
    },
    onSuccess: (data: { uploadId: string; transactionsCount: number; balanceImpact: number; success: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['bank_statement_uploads'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
      const balanceText = data.balanceImpact >= 0 
        ? `+R$ ${data.balanceImpact.toFixed(2)}` 
        : `-R$ ${Math.abs(data.balanceImpact).toFixed(2)}`;
      
      toast({
        title: 'Upload processado com sucesso!',
        description: `${data.transactionsCount} transações importadas. Saldo alterado: ${balanceText}`
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