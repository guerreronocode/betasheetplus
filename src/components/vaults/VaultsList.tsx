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
  editingVault: BankAccountVault | null;
  editForm?: React.ReactNode;
}

const VaultsList: React.FC<VaultsListProps> = ({ 
  vaults, 
  onEdit, 
  onDelete, 
  isDeleting = false,
  editingVault,
  editForm
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
        <div key={vault.id}>
          <Card className="p-2 border border-gray-200 bg-white/80 shadow-none" style={{ borderLeftColor: vault.color, borderLeftWidth: '3px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: vault.color }}
                />
                <div>
                  <h4 className="text-xs font-medium text-gray-800">{vault.name}</h4>
                  {vault.description && (
                    <p className="text-xs text-gray-600 truncate max-w-32">{vault.description}</p>
                  )}
                  <p className="text-xs font-semibold text-green-600 mt-0.5">
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
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(vault)}
                  disabled={isDeleting}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
          </Card>
          
          {editingVault?.id === vault.id && editForm && (
            <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4">
              {editForm}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VaultsList;