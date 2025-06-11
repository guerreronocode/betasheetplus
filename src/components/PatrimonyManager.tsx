
import React, { useState } from 'react';
import { Plus, Home, Car, Gem, CreditCard, Building2, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatrimony } from '@/hooks/usePatrimony';

const PatrimonyManager = () => {
  const {
    assets,
    liabilities,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    isAddingAsset,
    isAddingLiability,
    totalAssets,
    totalLiabilities,
  } = usePatrimony();

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingLiability, setEditingLiability] = useState<any>(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'imovel',
    current_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: '',
    description: ''
  });

  const [newLiability, setNewLiability] = useState({
    name: '',
    category: 'emprestimo',
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

  const getAssetIcon = (category: string) => {
    const icons = {
      imovel: <Home className="w-5 h-5" />,
      veiculo: <Car className="w-5 h-5" />,
      joias: <Gem className="w-5 h-5" />,
      outros: <Building2 className="w-5 h-5" />
    };
    return icons[category as keyof typeof icons] || <Building2 className="w-5 h-5" />;
  };

  const getLiabilityIcon = (category: string) => {
    const icons = {
      emprestimo: <CreditCard className="w-5 h-5" />,
      financiamento: <Home className="w-5 h-5" />,
      cartao_credito: <CreditCard className="w-5 h-5" />,
      outros: <Building2 className="w-5 h-5" />
    };
    return icons[category as keyof typeof icons] || <CreditCard className="w-5 h-5" />;
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.current_value) return;

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
      category: 'imovel',
      current_value: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_value: '',
      description: ''
    });
    setShowAddAsset(false);
  };

  const handleLiabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiability.name || !newLiability.total_amount || !newLiability.remaining_amount) return;

    const liabilityData = {
      name: newLiability.name,
      category: newLiability.category,
      total_amount: parseFloat(newLiability.total_amount),
      remaining_amount: parseFloat(newLiability.remaining_amount),
      interest_rate: parseFloat(newLiability.interest_rate) || 0,
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
      category: 'emprestimo',
      total_amount: '',
      remaining_amount: '',
      interest_rate: '',
      monthly_payment: '',
      due_date: '',
      description: ''
    });
    setShowAddLiability(false);
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setNewAsset({
      name: asset.name,
      category: asset.category,
      current_value: asset.current_value.toString(),
      purchase_date: asset.purchase_date,
      purchase_value: asset.purchase_value?.toString() || '',
      description: asset.description || ''
    });
    setShowAddAsset(true);
  };

  const handleEditLiability = (liability: any) => {
    setEditingLiability(liability);
    setNewLiability({
      name: liability.name,
      category: liability.category,
      total_amount: liability.total_amount.toString(),
      remaining_amount: liability.remaining_amount.toString(),
      interest_rate: liability.interest_rate.toString(),
      monthly_payment: liability.monthly_payment?.toString() || '',
      due_date: liability.due_date || '',
      description: liability.description || ''
    });
    setShowAddLiability(true);
  };

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Patrimônio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ativos</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Passivos</p>
              <p className="text-lg font-semibold">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${netWorth >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <Building2 className={`w-5 h-5 ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Patrimônio Líquido</p>
              <p className={`text-lg font-semibold ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Ativos</TabsTrigger>
          <TabsTrigger value="liabilities">Passivos</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ativos Patrimoniais</h3>
              <Button onClick={() => setShowAddAsset(!showAddAsset)}>
                <Plus className="w-4 h-4 mr-2" />
                {editingAsset ? 'Cancelar Edição' : 'Novo Ativo'}
              </Button>
            </div>

            {showAddAsset && (
              <form onSubmit={handleAssetSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asset-name">Nome do Ativo</Label>
                    <Input
                      id="asset-name"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      placeholder="Ex: Casa própria, Carro"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-category">Categoria</Label>
                    <Select value={newAsset.category} onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imovel">Imóvel</SelectItem>
                        <SelectItem value="veiculo">Veículo</SelectItem>
                        <SelectItem value="joias">Joias/Objetos de Valor</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="asset-current-value">Valor Atual</Label>
                    <Input
                      id="asset-current-value"
                      type="number"
                      step="0.01"
                      value={newAsset.current_value}
                      onChange={(e) => setNewAsset({ ...newAsset, current_value: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-purchase-value">Valor de Compra (opcional)</Label>
                    <Input
                      id="asset-purchase-value"
                      type="number"
                      step="0.01"
                      value={newAsset.purchase_value}
                      onChange={(e) => setNewAsset({ ...newAsset, purchase_value: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-purchase-date">Data de Aquisição</Label>
                    <Input
                      id="asset-purchase-date"
                      type="date"
                      value={newAsset.purchase_date}
                      onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-description">Descrição (opcional)</Label>
                    <Textarea
                      id="asset-description"
                      value={newAsset.description}
                      onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                      placeholder="Detalhes adicionais sobre o ativo"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isAddingAsset}>
                    {isAddingAsset ? 'Salvando...' : editingAsset ? 'Atualizar Ativo' : 'Adicionar Ativo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddAsset(false);
                    setEditingAsset(null);
                    setNewAsset({
                      name: '',
                      category: 'imovel',
                      current_value: '',
                      purchase_date: new Date().toISOString().split('T')[0],
                      purchase_value: '',
                      description: ''
                    });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {assets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum ativo cadastrado</p>
                  <p className="text-sm">Adicione seus primeiros ativos!</p>
                </div>
              ) : (
                assets.map((asset) => (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          {getAssetIcon(asset.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{asset.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(asset.current_value)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(asset.purchase_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditAsset(asset)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteAsset(asset.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Passivos (Dívidas)</h3>
              <Button onClick={() => setShowAddLiability(!showAddLiability)}>
                <Plus className="w-4 h-4 mr-2" />
                {editingLiability ? 'Cancelar Edição' : 'Novo Passivo'}
              </Button>
            </div>

            {showAddLiability && (
              <form onSubmit={handleLiabilitySubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="liability-name">Nome do Passivo</Label>
                    <Input
                      id="liability-name"
                      value={newLiability.name}
                      onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                      placeholder="Ex: Financiamento casa, Empréstimo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-category">Categoria</Label>
                    <Select value={newLiability.category} onValueChange={(value) => setNewLiability({ ...newLiability, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emprestimo">Empréstimo</SelectItem>
                        <SelectItem value="financiamento">Financiamento</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="liability-total">Valor Total</Label>
                    <Input
                      id="liability-total"
                      type="number"
                      step="0.01"
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
                      value={newLiability.remaining_amount}
                      onChange={(e) => setNewLiability({ ...newLiability, remaining_amount: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-interest">Taxa de Juros (% a.a.)</Label>
                    <Input
                      id="liability-interest"
                      type="number"
                      step="0.01"
                      value={newLiability.interest_rate}
                      onChange={(e) => setNewLiability({ ...newLiability, interest_rate: e.target.value })}
                      placeholder="12,50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-payment">Parcela Mensal (opcional)</Label>
                    <Input
                      id="liability-payment"
                      type="number"
                      step="0.01"
                      value={newLiability.monthly_payment}
                      onChange={(e) => setNewLiability({ ...newLiability, monthly_payment: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-due">Data de Vencimento (opcional)</Label>
                    <Input
                      id="liability-due"
                      type="date"
                      value={newLiability.due_date}
                      onChange={(e) => setNewLiability({ ...newLiability, due_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-description">Descrição (opcional)</Label>
                    <Textarea
                      id="liability-description"
                      value={newLiability.description}
                      onChange={(e) => setNewLiability({ ...newLiability, description: e.target.value })}
                      placeholder="Detalhes adicionais sobre o passivo"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isAddingLiability}>
                    {isAddingLiability ? 'Salvando...' : editingLiability ? 'Atualizar Passivo' : 'Adicionar Passivo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddLiability(false);
                    setEditingLiability(null);
                    setNewLiability({
                      name: '',
                      category: 'emprestimo',
                      total_amount: '',
                      remaining_amount: '',
                      interest_rate: '',
                      monthly_payment: '',
                      due_date: '',
                      description: ''
                    });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {liabilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum passivo cadastrado</p>
                  <p className="text-sm">Adicione seus passivos para um controle completo!</p>
                </div>
              ) : (
                liabilities.map((liability) => (
                  <Card key={liability.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                          {getLiabilityIcon(liability.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{liability.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{liability.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{formatCurrency(liability.remaining_amount)}</p>
                          <p className="text-sm text-gray-500">
                            {liability.interest_rate > 0 && `${liability.interest_rate}% a.a.`}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditLiability(liability)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteLiability(liability.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatrimonyManager;
