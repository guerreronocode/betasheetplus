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
      {/* Balanço Patrimonial */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold">Balanço Patrimonial</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ativos */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
              ATIVOS
            </h4>
            
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-800">Circulante</span>
                  <span className="font-bold text-green-600">{formatCurrency(ativosCirculantes)}</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Contas bancárias:</span>
                    <span>{formatCurrency(totalBankBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros ativos circulantes:</span>
                    <span>{formatCurrency(ativosCirculantes - totalBankBalance)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-800">Não Circulante</span>
                  <span className="font-bold text-green-600">{formatCurrency(ativosNaoCirculantes)}</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Investimentos:</span>
                    <span>{formatCurrency(currentInvestmentValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros ativos não circulantes:</span>
                    <span>{formatCurrency(ativosNaoCirculantes - currentInvestmentValue)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-900">TOTAL ATIVOS</span>
                  <span className="font-bold text-xl text-green-600">{formatCurrency(totalAtivos)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passivos */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">
              PASSIVOS
            </h4>
            
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-800">Circulante</span>
                  <span className="font-bold text-red-600">{formatCurrency(passivosCirculantes)}</span>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-800">Não Circulante</span>
                  <span className="font-bold text-red-600">{formatCurrency(passivosNaoCirculantes)}</span>
                </div>
              </div>

              <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-900">TOTAL PASSIVOS</span>
                  <span className="font-bold text-xl text-red-600">{formatCurrency(totalPassivos)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patrimônio Líquido */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
              PATRIMÔNIO LÍQUIDO
            </h4>
            
            <div className="space-y-3">
              <div className="p-6 bg-blue-100 rounded-lg border-2 border-blue-300">
                <div className="text-center">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-blue-900">PATRIMÔNIO LÍQUIDO</span>
                    <span className={`font-bold text-2xl ${patrimonioLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(patrimonioLiquido)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-blue-700 space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Ativos:</span>
                      <span className="font-medium">{formatCurrency(totalAtivos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>(-) Total de Passivos:</span>
                      <span className="font-medium">({formatCurrency(totalPassivos)})</span>
                    </div>
                    <hr className="border-blue-300" />
                    <div className="flex justify-between font-bold">
                      <span>Patrimônio Líquido:</span>
                      <span className={patrimonioLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}>
                        {formatCurrency(patrimonioLiquido)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gestão de Ativos e Passivos */}
      <Card className="p-6">
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assets" className="text-green-600">
              <Building2 className="w-4 h-4 mr-2" />
              Ativos
            </TabsTrigger>
            <TabsTrigger value="liabilities" className="text-red-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Passivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestão de Ativos</h3>
                <Button onClick={() => setIsAddingNewAsset(!isAddingNewAsset)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ativo
                </Button>
              </div>

              {isAddingNewAsset && (
                <form onSubmit={handleAssetSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="asset-name">Nome do Ativo</Label>
                      <Input
                        id="asset-name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="Ex: Apartamento Centro"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="asset-category">Categoria</Label>
                      <Select value={newAsset.category} onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <optgroup label="Ativo Circulante">
                            {assetCategories.circulante.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </optgroup>
                          <optgroup label="Ativo Não Circulante">
                            {assetCategories.nao_circulante.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </optgroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="asset-value">Valor Atual</Label>
                      <Input
                        id="asset-value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAsset.current_value}
                        onChange={(e) => setNewAsset({ ...newAsset, current_value: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="asset-purchase-value">Valor de Compra (Opcional)</Label>
                      <Input
                        id="asset-purchase-value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAsset.purchase_value}
                        onChange={(e) => setNewAsset({ ...newAsset, purchase_value: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="asset-date">Data de Aquisição</Label>
                      <Input
                        id="asset-date"
                        type="date"
                        value={newAsset.purchase_date}
                        onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="asset-description">Descrição (Opcional)</Label>
                      <Input
                        id="asset-description"
                        value={newAsset.description}
                        onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                        placeholder="Detalhes adicionais"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isAddingAsset}>
                      {isAddingAsset ? 'Salvando...' : editingAsset ? 'Atualizar' : 'Adicionar Ativo'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingNewAsset(false);
                      setEditingAsset(null);
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {assets.map((asset) => (
                  <Card key={asset.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{asset.name}</h4>
                        <p className="text-sm text-gray-600">{asset.category}</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(asset.current_value)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditAsset(asset)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteAsset(asset)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liabilities">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestão de Passivos</h3>
                <Button onClick={() => setIsAddingNewLiability(!isAddingNewLiability)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Passivo
                </Button>
              </div>

              {isAddingNewLiability && (
                <form onSubmit={handleLiabilitySubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="liability-name">Nome do Passivo</Label>
                      <Input
                        id="liability-name"
                        value={newLiability.name}
                        onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                        placeholder="Ex: Financiamento Casa"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="liability-category">Categoria</Label>
                      <Select value={newLiability.category} onValueChange={(value) => setNewLiability({ ...newLiability, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <optgroup label="Passivo Circulante">
                            {liabilityCategories.circulante.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </optgroup>
                          <optgroup label="Passivo Não Circulante">
                            {liabilityCategories.nao_circulante.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </optgroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="liability-total">Valor Total</Label>
                      <Input
                        id="liability-total"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLiability.total_amount}
                        onChange={(e) => setNewLiability({ ...newLiability, total_amount: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="liability-remaining">Valor Restante</Label>
                      <Input
                        id="liability-remaining"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLiability.remaining_amount}
                        onChange={(e) => setNewLiability({ ...newLiability, remaining_amount: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="liability-rate">Taxa de Juros (%)</Label>
                      <Input
                        id="liability-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLiability.interest_rate}
                        onChange={(e) => setNewLiability({ ...newLiability, interest_rate: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="liability-payment">Pagamento Mensal (Opcional)</Label>
                      <Input
                        id="liability-payment"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLiability.monthly_payment}
                        onChange={(e) => setNewLiability({ ...newLiability, monthly_payment: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isAddingLiability}>
                      {isAddingLiability ? 'Salvando...' : editingLiability ? 'Atualizar' : 'Adicionar Passivo'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingNewLiability(false);
                      setEditingLiability(null);
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {liabilities.map((liability) => (
                  <Card key={liability.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{liability.name}</h4>
                        <p className="text-sm text-gray-600">{liability.category}</p>
                        <p className="text-lg font-semibold text-red-600">{formatCurrency(liability.remaining_amount)}</p>
                        <p className="text-sm text-gray-500">
                          Total: {formatCurrency(liability.total_amount)} | Taxa: {liability.interest_rate}%
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditLiability(liability)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteLiability(liability)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PatrimonyManager;
