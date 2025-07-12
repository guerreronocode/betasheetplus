import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAccountReset } from '@/hooks/useAccountReset';

interface AccountResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountResetDialog = ({ open, onOpenChange }: AccountResetDialogProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);
  const { resetAccount, isResetting } = useAccountReset();

  const CONFIRMATION_WORD = 'ZERAR';
  const isConfirmationValid = confirmationText === CONFIRMATION_WORD;

  const handleFirstConfirmation = () => {
    if (isConfirmationValid) {
      setShowSecondConfirmation(true);
    }
  };

  const handleFinalConfirmation = () => {
    resetAccount();
    onOpenChange(false);
    setShowSecondConfirmation(false);
    setConfirmationText('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowSecondConfirmation(false);
    setConfirmationText('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zerar Todos os Dados
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p className="font-medium text-foreground">
              ⚠️ Esta ação apagará TODOS os seus dados financeiros do sistema.
            </p>
            <p>
              Serão removidos permanentemente:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Todas as transações (entradas e saídas)</li>
              <li>Transações recorrentes</li>
              <li>Objetivos e metas financeiras</li>
              <li>Orçamentos e planejamentos</li>
              <li>Cartões de crédito e compras</li>
              <li>Investimentos e aplicações</li>
              <li>Contas bancárias</li>
              <li>Dívidas registradas</li>
              <li>Score e estatísticas financeiras</li>
            </ul>
            <p className="font-medium text-destructive">
              🚫 Esta operação NÃO PODE ser desfeita!
            </p>
          </DialogDescription>
        </DialogHeader>

        {!showSecondConfirmation ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Para continuar, digite <span className="font-mono font-bold">{CONFIRMATION_WORD}</span> no campo abaixo:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                placeholder={`Digite ${CONFIRMATION_WORD}`}
                className="font-mono"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleFirstConfirmation}
                disabled={!isConfirmationValid}
              >
                Continuar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive text-center">
                🔴 CONFIRMAÇÃO FINAL
              </p>
              <p className="text-sm text-center mt-2">
                Você tem certeza absoluta de que deseja apagar todos os seus dados financeiros?
              </p>
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Esta é sua última chance de cancelar.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSecondConfirmation(false)}>
                Voltar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleFinalConfirmation}
                disabled={isResetting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isResetting ? 'Zerando...' : 'Zerar Definitivamente'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};