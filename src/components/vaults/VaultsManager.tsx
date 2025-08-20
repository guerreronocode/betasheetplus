import React, { useState } from 'react';
import { Plus, Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBankAccountVaults, BankAccountVault } from '@/hooks/useBankAccountVaults';
import VaultForm from './VaultForm';
import VaultsList from './VaultsList';

interface VaultsManagerProps {
  bankAccountId: string;
  bankAccountName: string;
  bankAccountBalance: number;
}

const VaultsManager: React.FC<VaultsManagerProps> = ({ 
  bankAccountId, 
  bankAccountName, 
  bankAccountBalance 
}) => {
  const { 
    vaults, 
    vaultsLoading, 
    addVault, 
    updateVault, 
    deleteVault,
    isAddingVault, 
    isUpdatingVault, 
    isDeletingVault,
    getTotalReserved 
  } = useBankAccountVaults(bankAccountId);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingVault, setEditingVault] = useState<BankAccountVault | null>(null);

  const totalReserved = getTotalReserved(bankAccountId);
  const availableAmount = bankAccountBalance - totalReserved;

  const handleAddVault = (vaultData: any) => {
    addVault(vaultData);
    setIsAddingNew(false);
  };

  const handleUpdateVault = (vaultData: any) => {
    updateVault(vaultData);
    setEditingVault(null);
  };

  const handleEditVault = (vault: BankAccountVault) => {
    setEditingVault(vault);
    setIsAddingNew(false);
  };

  const handleDeleteVault = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cofre?')) {
      deleteVault(id);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingVault(null);
  };

  if (vaultsLoading) {
    return <div>Carregando cofres...</div>;
  }

  return (
    <Card className="p-6 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Vault className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cofres - {bankAccountName}</h3>
            <p className="text-sm text-muted-foreground">
              Disponível: {availableAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • 
              Reservado: {totalReserved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsAddingNew(!isAddingNew)} 
          disabled={availableAmount <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cofre
        </Button>
      </div>

      {isAddingNew && (
        <VaultForm
          bankAccountId={bankAccountId}
          bankAccountBalance={bankAccountBalance}
          totalReserved={totalReserved}
          onSubmit={handleAddVault}
          onCancel={handleCancel}
          isSaving={isAddingVault}
        />
      )}

      {editingVault && (
        <VaultForm
          bankAccountId={bankAccountId}
          bankAccountBalance={bankAccountBalance}
          totalReserved={totalReserved}
          onSubmit={handleUpdateVault}
          onCancel={handleCancel}
          isSaving={isUpdatingVault}
          initialData={editingVault}
        />
      )}

      <VaultsList
        vaults={vaults}
        onEdit={handleEditVault}
        onDelete={handleDeleteVault}
        isDeleting={isDeletingVault}
      />
    </Card>
  );
};

export default VaultsManager;