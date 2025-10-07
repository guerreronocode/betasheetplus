import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InvestmentAportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId: string;
  month: Date;
}

const InvestmentAportHistoryDialog: React.FC<InvestmentAportHistoryDialogProps> = ({
  open,
  onOpenChange,
  investmentId,
  month,
}) => {
  // TODO: Implementar busca de logs de aportes do banco
  // Por enquanto, apenas um placeholder
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Aportes</DialogTitle>
          <DialogDescription>
            Todos os aportes realizados neste investimento durante este mês
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá visualizar todos os logs de aportes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentAportHistoryDialog;
