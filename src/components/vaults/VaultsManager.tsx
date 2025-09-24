import React, { useState } from 'react';
import { Plus, Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBankAccountVaults, BankAccountVault } from '@/hooks/useBankAccountVaults';
import VaultForm from './VaultForm';
import VaultsList from './VaultsList';
import VaultDeleteDialog from './VaultDeleteDialog';

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
  const [deletingVault, setDeletingVault] = useState<BankAccountVault | null>(null);

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

  const handleDeleteVault = (vault: BankAccountVault) => {
    setDeletingVault(vault);
  };

  const handleConfirmDelete = () => {
    if (deletingVault) {
      deleteVault(deletingVault.id);
      setDeletingVault(null);
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
    <Card className="p-4 mt-3 bg-gray-50/50 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Cofres - {bankAccountName}</h3>
          </div>
        </div>
        
        <Button 
          size="sm"
          onClick={() => setIsAddingNew(!isAddingNew)} 
          disabled={availableAmount <= 0}
          className="h-6 px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          <span className="text-xs">Novo</span>
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

      <VaultDeleteDialog
        open={!!deletingVault}
        onOpenChange={(open) => !open && setDeletingVault(null)}
        vault={deletingVault}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingVault}
      />
    </Card>
  );
};

export default VaultsManager;