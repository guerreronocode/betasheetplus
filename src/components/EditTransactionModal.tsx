
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Trash2 } from 'lucide-react';

const EditTransactionModal = ({ open, onOpenChange, transaction }: any) => {
  const { addIncome, addExpense } = useFinancialData();
  const [form, setForm] = useState<any>(transaction);

  React.useEffect(() => {
    setForm(transaction);
  }, [transaction]);
  if (!transaction) return null;

  const handleSave = () => {
    // Lógica para editar transação (a ser integrada)
    onOpenChange();
  };
  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.")) {
      // Lógica para deletar transação
      onOpenChange();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mb-3">
          <Input
            value={form?.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição"
          />
          <Input
            value={form?.amount || ''}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Valor"
            type="number"
            min={0}
          />
        </div>
        <DialogFooter className="flex justify-between gap-2">
          <Button variant="destructive" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default EditTransactionModal;
