import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vault, Edit2, Trash2 } from 'lucide-react';
import { BankAccountVault } from '@/hooks/useBankAccountVaults';

interface VaultsListProps {
  vaults: BankAccountVault[];
  onEdit: (vault: BankAccountVault) => void;
  onDelete: (vault: BankAccountVault) => void;
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
        <p className="text-xs">Nenhum cofre criado</p>
        <p className="text-xs">Crie um cofre para reservar dinheiro!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {vaults.map((vault) => (
        <Card key={vault.id} className="p-3 border border-gray-300 bg-white shadow-sm" style={{ borderLeftColor: vault.color, borderLeftWidth: '4px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: vault.color }}
              />
              <div>
                <h4 className="text-sm font-medium text-gray-800">{vault.name}</h4>
                {vault.description && (
                  <p className="text-xs text-gray-600">{vault.description}</p>
                )}
                <p className="text-sm font-semibold text-green-600 mt-1">
                  {vault.reserved_amount.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vault)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vault)}
                disabled={isDeleting}
                className="h-7 w-7 p-0"
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