import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, BarChart3, Building2, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import PatrimonyBalanceHeader from "./PatrimonyBalanceHeader";
import PatrimonyListManager from "./PatrimonyListManager";
import AssetForm from "./AssetForm";
import LiabilityForm from "./LiabilityForm";

const assetCategories = {
  circulante: [
    'Dinheiro em espécie',
    'Conta corrente',
    'Poupança',
    'CDB até 1 ano',
    'Aplicações de curto prazo',
    'Outros ativos circulantes'
  ],
  nao_circulante: [
    'Imóveis',
    'Veículos',
    'Investimentos de longo prazo',
    'CDB acima de 1 ano',
    'Ações e fundos',
    'Outros ativos não circulantes'
  ]
};

const liabilityCategories = {
  circulante: [
    'Cartão de crédito',
    'Empréstimos pessoais',
    'Cheque especial',
    'Financiamentos até 1 ano',
    'Outros passivos circulantes'
  ],
  nao_circulante: [
    'Financiamento imobiliário',
    'Financiamento de veículo',
    'Empréstimos de longo prazo',
    'Outros passivos não circulantes'
  ]
};

const PatrimonyManager = () => {
  const {
    assets,
    liabilities,
    isLoading,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    isAddingAsset,
    isAddingLiability
  } = usePatrimony();

  const { bankAccounts, currentInvestmentValue } = useFinancialData();

  const [isAddingNewAsset, setIsAddingNewAsset] = useState(false);
  const [isAddingNewLiability, setIsAddingNewLiability] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingLiability, setEditingLiability] = useState<any>(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    current_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: '',
    description: ''
  });

  const [newLiability, setNewLiability] = useState({
    name: '',
    category: '',
    total_amount: '',
    remaining_amount: '',
    interest_rate: '',
    monthly_payment: '',
    due_date: '',
    description: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Adiciona handlers de editar/excluir:
  const handleEditAsset = (asset: any) => {
    setIsAddingNewAsset(true);
    setEditingAsset(asset);
    setNewAsset({
      name: asset.name,
      category: asset.category,
      current_value: asset.current_value.toString(),
      purchase_date: asset.purchase_date,
      purchase_value: asset.purchase_value ? asset.purchase_value.toString() : "",
      description: asset.description || "",
    });
  };

  const handleEditLiability = (liability: any) => {
    setIsAddingNewLiability(true);
    setEditingLiability(liability);
    setNewLiability({
      name: liability.name,
      category: liability.category,
      total_amount: liability.total_amount.toString(),
      remaining_amount: liability.remaining_amount.toString(),
      interest_rate: liability.interest_rate ? liability.interest_rate.toString() : "",
      monthly_payment: liability.monthly_payment ? liability.monthly_payment.toString() : "",
      due_date: liability.due_date || "",
      description: liability.description || "",
    });
  };

  const handleDeleteAsset = (asset: any) => {
    deleteAsset(asset.id);
  };

  const handleDeleteLiability = (liability: any) => {
    deleteLiability(liability.id);
  };

  // Calcular valores por categoria
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  const ativosCirculantes = assets
    .filter(asset => assetCategories.circulante.includes(asset.category))
    .reduce((sum, asset) => sum + asset.current_value, 0) + totalBankBalance;
    
  const ativosNaoCirculantes = assets
    .filter(asset => assetCategories.nao_circulante.includes(asset.category))
    .reduce((sum, asset) => sum + asset.current_value, 0) + currentInvestmentValue;

  const passivosCirculantes = liabilities
    .filter(liability => liabilityCategories.circulante.includes(liability.category))
    .reduce((sum, liability) => sum + liability.remaining_amount, 0);

  const passivosNaoCirculantes = liabilities
    .filter(liability => liabilityCategories.nao_circulante.includes(liability.category))
    .reduce((sum, liability) => sum + liability.remaining_amount, 0);

  const totalAtivos = ativosCirculantes + ativosNaoCirculantes;
  const totalPassivos = passivosCirculantes + passivosNaoCirculantes;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.category || !newAsset.current_value) return;

    const assetData = {
      name: newAsset.name,
      category: newAsset.category,
      current_value: parseFloat(newAsset.current_value),
      purchase_date: newAsset.purchase_date,
      purchase_value: newAsset.purchase_value ? parseFloat(newAsset.purchase_value) : undefined,
      description: newAsset.description || undefined
    };

    if (editingAsset) {
      updateAsset({ id: editingAsset.id, ...assetData });
      setEditingAsset(null);
    } else {
      addAsset(assetData);
    }

    setNewAsset({
      name: '',
      category: '',
      current_value: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_value: '',
      description: ''
    });
    setIsAddingNewAsset(false);
  };

  const handleLiabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiability.name || !newLiability.category || !newLiability.total_amount || !newLiability.remaining_amount) return;

    const liabilityData = {
      name: newLiability.name,
      category: newLiability.category,
      total_amount: parseFloat(newLiability.total_amount),
      remaining_amount: parseFloat(newLiability.remaining_amount),
      interest_rate: newLiability.interest_rate ? parseFloat(newLiability.interest_rate) : 0,
      monthly_payment: newLiability.monthly_payment ? parseFloat(newLiability.monthly_payment) : undefined,
      due_date: newLiability.due_date || undefined,
      description: newLiability.description || undefined
    };

    if (editingLiability) {
      updateLiability({ id: editingLiability.id, ...liabilityData });
      setEditingLiability(null);
    } else {
      addLiability(liabilityData);
    }

    setNewLiability({
      name: '',
      category: '',
      total_amount: '',
      remaining_amount: '',
      interest_rate: '',
      monthly_payment: '',
      due_date: '',
      description: ''
    });
    setIsAddingNewLiability(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PatrimonyBalanceHeader
        ativosCirculantes={ativosCirculantes}
        ativosNaoCirculantes={ativosNaoCirculantes}
        passivosCirculantes={passivosCirculantes}
        passivosNaoCirculantes={passivosNaoCirculantes}
        totalAtivos={totalAtivos}
        totalPassivos={totalPassivos}
        patrimonioLiquido={patrimonioLiquido}
        totalBankBalance={totalBankBalance}
        currentInvestmentValue={currentInvestmentValue}
        formatCurrency={formatCurrency}
      />
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Gestão de Ativos</h3>
              <Button onClick={() => setIsAddingNewAsset(!isAddingNewAsset)}>
                Novo Ativo
              </Button>
            </div>
            {isAddingNewAsset && (
              <AssetForm
                onSubmit={handleAssetSubmit}
                onCancel={() => {
                  setIsAddingNewAsset(false);
                  setEditingAsset(null);
                }}
                isLoading={isAddingAsset}
                editingAsset={editingAsset}
                newAsset={newAsset}
                setNewAsset={setNewAsset}
              />
            )}
            <PatrimonyListManager
              title=""
              items={assets}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              valueKey="current_value"
              valueColor="text-green-600"
              currencyFormatter={formatCurrency}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Gestão de Passivos</h3>
              <Button onClick={() => setIsAddingNewLiability(!isAddingNewLiability)}>
                Novo Passivo
              </Button>
            </div>
            {isAddingNewLiability && (
              <LiabilityForm
                onSubmit={handleLiabilitySubmit}
                onCancel={() => {
                  setIsAddingNewLiability(false);
                  setEditingLiability(null);
                }}
                isLoading={isAddingLiability}
                editingLiability={editingLiability}
                newLiability={newLiability}
                setNewLiability={setNewLiability}
              />
            )}
            <PatrimonyListManager
              title=""
              items={liabilities}
              onEdit={handleEditLiability}
              onDelete={handleDeleteLiability}
              valueKey="remaining_amount"
              valueColor="text-red-600"
              currencyFormatter={formatCurrency}
              valueLabel="Total"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatrimonyManager;
