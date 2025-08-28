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

  // Extrair período do arquivo OFX
  const extractOFXPeriod = (fileContent: string): { start: string; end: string } => {
    // Buscar tags DTSTART e DTEND
    const dtStartMatch = fileContent.match(/<DTSTART>(\d{8}|\d{14})/);
    const dtEndMatch = fileContent.match(/<DTEND>(\d{8}|\d{14})/);
    
    let periodStart = '';
    let periodEnd = '';
    
    if (dtStartMatch) {
      const dateStr = dtStartMatch[1];
      if (dateStr.length >= 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        periodStart = `${year}-${month}-${day}`;
      }
    }
    
    if (dtEndMatch) {
      const dateStr = dtEndMatch[1];
      if (dateStr.length >= 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        periodEnd = `${year}-${month}-${day}`;
      }
    }
    
    if (!periodStart || !periodEnd) {
      throw new Error('Não foi possível extrair o período do extrato (DTSTART/DTEND não encontradas)');
    }
    
    return { start: periodStart, end: periodEnd };
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

      // Extrair período do extrato
      const { start: periodStart, end: periodEnd } = extractOFXPeriod(fileContent);
      
      // Parse do arquivo OFX
      const parsedTransactions = processOFXFile(fileContent);
      
      if (parsedTransactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo');
      }

      let uploadId: string | null = null;
      let balanceChange = 0;
      
      try {
        // 1. Criar o registro de upload
        const { data: uploadData, error: uploadError } = await supabase
          .from('bank_statement_uploads')
          .insert({
            user_id: user.id,
            upload_name: uploadName,
            upload_date: new Date().toISOString(),
            total_transactions: parsedTransactions.length
          })
          .select()
          .single();

        if (uploadError) throw new Error(`Erro ao criar upload: ${uploadError.message}`);
        uploadId = uploadData.id;

        // 2. Buscar transações existentes no período para calcular impacto no saldo
        const [existingIncomeResponse, existingExpensesResponse] = await Promise.all([
          supabase
            .from('income')
            .select('amount')
            .eq('user_id', user.id)
            .eq('bank_account_id', bankAccountId)
            .gte('date', periodStart)
            .lte('date', periodEnd),
          supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .eq('bank_account_id', bankAccountId)
            .gte('date', periodStart)
            .lte('date', periodEnd)
        ]);

        if (existingIncomeResponse.error) throw new Error(`Erro ao buscar receitas existentes: ${existingIncomeResponse.error.message}`);
        if (existingExpensesResponse.error) throw new Error(`Erro ao buscar despesas existentes: ${existingExpensesResponse.error.message}`);

        // Calcular saldo das transações que serão removidas (todas do período)
        const removedIncomeBalance = existingIncomeResponse.data?.reduce((sum, item) => sum + item.amount, 0) || 0;
        const removedExpensesBalance = existingExpensesResponse.data?.reduce((sum, item) => sum + item.amount, 0) || 0;

        // 3. Excluir todas as transações existentes no período
        const [deleteIncomeResponse, deleteExpensesResponse] = await Promise.all([
          supabase
            .from('income')
            .delete()
            .eq('user_id', user.id)
            .eq('bank_account_id', bankAccountId)
            .gte('date', periodStart)
            .lte('date', periodEnd),
          supabase
            .from('expenses')
            .delete()
            .eq('user_id', user.id)
            .eq('bank_account_id', bankAccountId)
            .gte('date', periodStart)
            .lte('date', periodEnd)
        ]);

        if (deleteIncomeResponse.error) throw new Error(`Erro ao excluir receitas existentes: ${deleteIncomeResponse.error.message}`);
        if (deleteExpensesResponse.error) throw new Error(`Erro ao excluir despesas existentes: ${deleteExpensesResponse.error.message}`);

        // 4. Inserir novas transações do extrato
        const incomeTransactions = parsedTransactions
          .filter(t => t.type === 'income')
          .map(t => ({
            user_id: user.id,
            amount: t.amount,
            date: t.date,
            description: t.description,
            category: 'Outros',
            bank_account_id: bankAccountId,
            upload_id: uploadId
          }));

        const expenseTransactions = parsedTransactions
          .filter(t => t.type === 'expense')
          .map(t => ({
            user_id: user.id,
            amount: t.amount,
            date: t.date,
            description: t.description,
            category: 'Outros',
            bank_account_id: bankAccountId,
            upload_id: uploadId
          }));

        if (incomeTransactions.length > 0) {
          const { error: incomeInsertError } = await supabase
            .from('income')
            .insert(incomeTransactions);
          
          if (incomeInsertError) throw new Error(`Erro ao inserir receitas: ${incomeInsertError.message}`);
        }

        if (expenseTransactions.length > 0) {
          const { error: expenseInsertError } = await supabase
            .from('expenses')
            .insert(expenseTransactions);
          
          if (expenseInsertError) throw new Error(`Erro ao inserir despesas: ${expenseInsertError.message}`);
        }

        // 5. Calcular novo saldo das transações inseridas
        const newIncomeBalance = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const newExpensesBalance = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Calcular mudança líquida no saldo
        balanceChange = (newIncomeBalance - newExpensesBalance) - (removedIncomeBalance - removedExpensesBalance);

        // 6. Buscar saldo atual e atualizar
        const { data: bankAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', bankAccountId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw new Error(`Erro ao buscar saldo atual: ${fetchError.message}`);

        const newBalance = (bankAccount.balance || 0) + balanceChange;
        
        const { error: balanceUpdateError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', bankAccountId)
          .eq('user_id', user.id);

        if (balanceUpdateError) throw new Error(`Erro ao atualizar saldo: ${balanceUpdateError.message}`);

        return {
          uploadId,
          transactionsCount: parsedTransactions.length,
          balanceImpact: balanceChange,
          success: true
        };

      } catch (error) {
        // Em caso de erro, tentar limpar o upload criado
        if (uploadId) {
          await supabase
            .from('bank_statement_uploads')
            .delete()
            .eq('id', uploadId);
        }
        throw error;
      }
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