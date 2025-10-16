import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useInvestmentLogs, InvestmentLog } from '@/hooks/useInvestmentLogs';
import { useInvestments } from '@/hooks/useInvestments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, TrendingUp, TrendingDown, RefreshCw, Edit } from 'lucide-react';

interface InvestmentAportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId?: string;
}

const InvestmentAportHistoryDialog: React.FC<InvestmentAportHistoryDialogProps> = ({
  open,
  onOpenChange,
  investmentId: initialInvestmentId,
}) => {
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | undefined>(initialInvestmentId);
  const { investments } = useInvestments();
  const { logs, updateLog, deleteLog, isDeletingLog, isUpdatingLog } = useInvestmentLogs(selectedInvestmentId);
  
  const [editingLog, setEditingLog] = useState<InvestmentLog | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    notes: '',
  });

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'aport':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'update_value':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'aport':
        return 'Aporte';
      case 'withdraw':
        return 'Resgate';
      case 'update_value':
        return 'Atualização de Valor';
      default:
        return type;
    }
  };

  const handleEditClick = (log: InvestmentLog) => {
    setEditingLog(log);
    setEditForm({
      amount: log.amount.toString(),
      notes: log.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;

    await updateLog({
      logId: editingLog.id,
      data: {
        amount: parseFloat(editForm.amount),
        notes: editForm.notes || null,
      },
    });

    setEditingLog(null);
    setEditForm({ amount: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Operações</DialogTitle>
          <DialogDescription>
            Visualize todos os aportes, retiradas e atualizações de valor dos seus investimentos
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Investimento:</label>
            <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um investimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os investimentos</SelectItem>
                {investments.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum log encontrado para este investimento
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const investment = investments.find(i => i.id === log.investment_id);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getOperationIcon(log.operation_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getOperationLabel(log.operation_type)}</span>
                          {selectedInvestmentId === 'all' && investment && (
                            <span className="text-xs text-muted-foreground">({investment.name})</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(log.month_date), "MMMM 'de' yyyy", { locale: ptBR })}
                          {' • '}
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${log.operation_type === 'withdraw' ? 'text-red-600' : ''}`}>
                          {log.operation_type === 'withdraw' ? '- ' : ''}
                          R$ {log.amount.toFixed(2)}
                        </div>
                        {log.previous_value !== null && log.new_value !== null && (
                          <div className="text-xs text-muted-foreground">
                            {log.previous_value.toFixed(2)} → {log.new_value.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {(log.operation_type === 'aport') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(log)}
                          disabled={isUpdatingLog || isDeletingLog}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLog(log.id)}
                        disabled={isDeletingLog}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Edit Log Dialog */}
      <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Operação</DialogTitle>
            <DialogDescription>
              Edite os detalhes da operação de {editingLog ? getOperationLabel(editingLog.operation_type).toLowerCase() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-amount">Valor</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Observações</Label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione uma observação (opcional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingLog(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isUpdatingLog || !editForm.amount}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default InvestmentAportHistoryDialog;
