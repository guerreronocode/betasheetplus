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
      <div className="text-center py-8 text-muted-foreground">
        <Vault className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum cofre criado</p>
        <p className="text-sm">Crie um cofre para reservar dinheiro para suas metas!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vaults.map((vault) => (
        <Card key={vault.id} className="p-4 border-l-4" style={{ borderLeftColor: vault.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: vault.color }}
              >
                <Vault className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">{vault.name}</h4>
                {vault.description && (
                  <p className="text-sm text-muted-foreground">{vault.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right mr-3">
                <p className="text-sm text-muted-foreground">Reservado</p>
                <p className="font-semibold text-green-600">
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
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vault.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VaultsList;