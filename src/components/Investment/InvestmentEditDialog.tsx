import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvestmentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  onEdit: (id: string, name: string) => void;
  isLoading?: boolean;
}

const InvestmentEditDialog: React.FC<InvestmentEditDialogProps> = ({
  isOpen,
  onClose,
  investment,
  onEdit,
  isLoading = false
}) => {
  const [name, setName] = React.useState(investment?.name || '');

  React.useEffect(() => {
    if (investment) {
      setName(investment.name);
    }
  }, [investment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onEdit(investment.id, name.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Investimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: PETR4, Tesouro Direto, Bitcoin"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentEditDialog;