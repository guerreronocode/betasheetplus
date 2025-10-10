import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvestmentVaults } from '@/hooks/useInvestmentVaults';
import { useInvestments } from '@/hooks/useInvestments';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentVaultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId?: string;
}

const InvestmentVaultsDialog: React.FC<InvestmentVaultsDialogProps> = ({
  open,
  onOpenChange,
  investmentId: initialInvestmentId,
}) => {
  const { investments } = useInvestments();
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | undefined>(initialInvestmentId);
  const { vaults, addVault, updateVault, deleteVault, getTotalReserved, isAddingVault } = useInvestmentVaults(selectedInvestmentId);
  
  const [showForm, setShowForm] = useState(false);
  const [editingVault, setEditingVault] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reserved_amount: 0,
    color: '#10B981',
  });

  const selectedInvestment = investments.find(inv => inv.id === selectedInvestmentId);
  const totalReserved = selectedInvestmentId ? getTotalReserved(selectedInvestmentId) : 0;
  const availableAmount = selectedInvestment ? (selectedInvestment.current_value - totalReserved) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestmentId) return;

    if (editingVault) {
      await updateVault({
        id: editingVault,
        ...formData,
      });
    } else {
      await addVault({
        investment_id: selectedInvestmentId,
        ...formData,
      });
    }

    setShowForm(false);
    setEditingVault(null);
    setFormData({
      name: '',
      description: '',
      reserved_amount: 0,
      color: '#10B981',
    });
  };

  const handleEdit = (vault: any) => {
    setEditingVault(vault.id);
    setFormData({
      name: vault.name,
      description: vault.description || '',
      reserved_amount: vault.reserved_amount,
      color: vault.color,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVault(null);
    setFormData({
      name: '',
      description: '',
      reserved_amount: 0,
      color: '#10B981',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cofres de Investimentos</DialogTitle>
          <DialogDescription>
            Organize e reserve valores dentro dos seus investimentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Label>Investimento:</Label>
            <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um investimento" />
              </SelectTrigger>
              <SelectContent>
                {investments.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedInvestment && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valor Total:</span>
                <span className="font-semibold">{formatCurrency(selectedInvestment.current_value)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Reservado:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(totalReserved)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Disponível:</span>
                <span className="font-semibold text-green-600">{formatCurrency(availableAmount)}</span>
              </div>
            </div>
          )}

          {!showForm && selectedInvestmentId && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cofre
            </Button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="name">Nome do Cofre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Reserva de Emergência"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do cofre"
                />
              </div>

              <div>
                <Label htmlFor="reserved_amount">Valor Reservado</Label>
                <Input
                  id="reserved_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={editingVault ? undefined : availableAmount}
                  value={formData.reserved_amount}
                  onChange={(e) => setFormData({ ...formData, reserved_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isAddingVault}>
                  {editingVault ? 'Atualizar' : 'Criar'} Cofre
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {selectedInvestmentId && vaults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Cofres Existentes</h4>
              {vaults.map((vault) => (
                <div
                  key={vault.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: vault.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{vault.name}</div>
                      {vault.description && (
                        <div className="text-xs text-muted-foreground">{vault.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(vault.reserved_amount)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(vault)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVault(vault.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentVaultsDialog;
