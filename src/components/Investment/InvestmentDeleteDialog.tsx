import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  onDelete: (investmentId: string) => void;
  isLoading?: boolean;
}

const InvestmentDeleteDialog: React.FC<InvestmentDeleteDialogProps> = ({
  isOpen,
  onClose,
  investment,
  onDelete,
  isLoading = false
}) => {
  const handleDelete = () => {
    onDelete(investment.id);
    onClose();
  };

  if (!investment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Excluir Investimento
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O investimento será permanentemente removido do seu portfólio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">{investment.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-red-700">
            <div>
              <p>Valor Investido:</p>
              <p className="font-semibold">{formatCurrency(investment.amount)}</p>
            </div>
            <div>
              <p>Valor Atual:</p>
              <p className="font-semibold">{formatCurrency(investment.current_value || investment.amount)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir Investimento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDeleteDialog;