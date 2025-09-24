import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vault, Edit2, Trash2 } from 'lucide-react';
import { BankAccountVault } from '@/hooks/useBankAccountVaults';

interface VaultsListProps {
  vaults: BankAccountVault[];
  onEdit: (vault: BankAccountVault) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const VaultsList: React.FC<VaultsListProps> = ({ 
  vaults, 
  onEdit, 
  onDelete, 
  isDeleting = false 
}) => {
  if (vaults.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Vault className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Nenhum cofre criado</p>
        <p className="text-xs">Crie um cofre para reservar dinheiro!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {vaults.map((vault) => (
        <Card key={vault.id} className="p-2 border-l-4" style={{ borderLeftColor: vault.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="p-1 rounded-md text-white"
                style={{ backgroundColor: vault.color }}
              >
                <Vault className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{vault.name}</h4>
                {vault.description && (
                  <p className="text-xs text-muted-foreground">{vault.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="text-right mr-2">
                <p className="text-xs text-muted-foreground">Reservado</p>
                <p className="text-sm font-medium text-green-600">
                  {vault.reserved_amount.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vault)}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vault.id)}
                disabled={isDeleting}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VaultsList;