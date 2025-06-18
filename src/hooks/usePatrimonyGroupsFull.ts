
import { useMemo } from 'react';
import { useCreditCardDebts } from './useCreditCardDebts';

interface UsePatrimonyGroupsFullProps {
  assets: any[];
  liabilities: any[];
  investments: any[];
  bankAccounts: any[];
  debts: any[];
}

export const usePatrimonyGroupsFull = ({
  assets,
  liabilities,
  investments,
  bankAccounts,
  debts,
}: UsePatrimonyGroupsFullProps) => {
  
  const { creditCardDebts } = useCreditCardDebts();
  
  return useMemo(() => {
    const ativoCirculante = [
      // Contas bancárias
      ...bankAccounts
        .filter(account => account.is_active)
        .map(account => ({
          id: account.id,
          name: account.name,
          current_value: Number(account.balance),
          category: 'Conta Bancária',
          description: `${account.bank_name} - ${account.account_type}`,
          isLinked: true,
          source: 'bank_account'
        })),
      
      // Investimentos líquidos
      ...investments
        .filter(inv => inv.liquidity === 'daily')
        .map(inv => ({
          id: inv.id,
          name: inv.name,
          current_value: Number(inv.current_value || inv.amount),
          category: 'Investimento',
          description: `${inv.type} - Liquidez diária`,
          isLinked: true,
          source: 'investment'
        })),
      
      // Ativos manuais circulantes
      ...assets.filter(asset => asset.category === 'ativo_circulante')
    ];

    const ativoNaoCirculante = [
      // Investimentos não líquidos
      ...investments
        .filter(inv => inv.liquidity !== 'daily')
        .map(inv => ({
          id: inv.id,
          name: inv.name,
          current_value: Number(inv.current_value || inv.amount),
          category: 'Investimento',
          description: `${inv.type} - ${inv.liquidity}`,
          isLinked: true,
          source: 'investment'
        })),
      
      // Ativos manuais não circulantes
      ...assets.filter(asset => asset.category === 'ativo_nao_circulante')
    ];

    const passivoCirculante = [
      // Dívidas com vencimento <= 12 meses
      ...debts
        .filter(debt => {
          if (debt.status !== 'active') return false;
          const dueDate = new Date(debt.due_date);
          const twelveMonthsFromNow = new Date();
          twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
          return dueDate <= twelveMonthsFromNow;
        })
        .map(debt => ({
          id: debt.id,
          name: debt.description,
          remaining_amount: Number(debt.remaining_balance),
          category: 'Dívida',
          description: `${debt.creditor} - Vence em ${new Date(debt.due_date).toLocaleDateString()}`,
          isDebt: true,
          isLinked: true,
          source: 'debt'
        })),
      
      // CRÍTICO: Dívidas de cartão de crédito APENAS de cartões ATIVOS
      ...creditCardDebts.map(debt => ({
        id: debt.id,
        name: `Dívida - ${debt.card_name}`,
        remaining_amount: debt.total_debt,
        category: 'Cartão de Crédito',
        description: `Parcelas não quitadas do cartão ${debt.card_name}`,
        isCreditCard: true,
        isLinked: true,
        source: 'credit_card_debt'
      })),
      
      // APENAS passivos manuais - NUNCA de cartão de crédito
      ...liabilities.filter(liability => 
        liability.category === 'passivo_circulante' && 
        liability.category !== 'cartao_credito'
      )
    ];

    const passivoNaoCirculante = [
      // Dívidas com vencimento > 12 meses
      ...debts
        .filter(debt => {
          if (debt.status !== 'active') return false;
          const dueDate = new Date(debt.due_date);
          const twelveMonthsFromNow = new Date();
          twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
          return dueDate > twelveMonthsFromNow;
        })
        .map(debt => ({
          id: debt.id,
          name: debt.description,
          remaining_amount: Number(debt.remaining_balance),
          category: 'Dívida',
          description: `${debt.creditor} - Vence em ${new Date(debt.due_date).toLocaleDateString()}`,
          isDebt: true,
          isLinked: true,
          source: 'debt'
        })),
      
      // Passivos manuais não circulantes (excluindo cartões)
      ...liabilities.filter(liability => 
        liability.category === 'passivo_nao_circulante' && 
        liability.category !== 'cartao_credito'
      )
    ];

    const groups = {
      ativo_circulante: ativoCirculante,
      ativo_nao_circulante: ativoNaoCirculante,
      passivo_circulante: passivoCirculante,
      passivo_nao_circulante: passivoNaoCirculante,
    };

    const totals = {
      ativo_circulante: ativoCirculante.reduce((sum, item) => sum + (item.current_value || 0), 0),
      ativo_nao_circulante: ativoNaoCirculante.reduce((sum, item) => sum + (item.current_value || 0), 0),
      passivo_circulante: passivoCirculante.reduce((sum, item) => sum + (item.remaining_amount || 0), 0),
      passivo_nao_circulante: passivoNaoCirculante.reduce((sum, item) => sum + (item.remaining_amount || 0), 0),
    };

    // Identificar itens não vinculados
    const linkedBankAccountIds = ativoCirculante.filter(item => item.source === 'bank_account').map(item => item.id);
    const linkedInvestmentIds = [...ativoCirculante, ...ativoNaoCirculante].filter(item => item.source === 'investment').map(item => item.id);
    const linkedDebtIds = [...passivoCirculante, ...passivoNaoCirculante].filter(item => item.source === 'debt').map(item => item.id);

    const nonLinkedBankAccounts = bankAccounts.filter(acc => !linkedBankAccountIds.includes(acc.id));
    const nonLinkedInvestments = investments.filter(inv => !linkedInvestmentIds.includes(inv.id));
    const nonLinkedDebts = debts.filter(debt => !linkedDebtIds.includes(debt.id));

    return {
      groups,
      totals,
      nonLinkedBankAccounts,
      nonLinkedInvestments,
      nonLinkedDebts,
    };
  }, [assets, liabilities, investments, bankAccounts, debts, creditCardDebts]);
};
