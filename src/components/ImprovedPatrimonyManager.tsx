import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2, Building, Car, Diamond, Banknote, CreditCard, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatrimony } from '@/hooks/usePatrimony';

const assetCategories = [
  { value: 'imoveis', label: 'Imóveis', icon: Home },
  { value: 'veiculos', label: 'Veículos', icon: Car },
  { value: 'joias', label: 'Joias e Metais Preciosos', icon: Diamond },
  { value: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  { value: 'dinheiro', label: 'Dinheiro em Espécie', icon: Banknote },
  { value: 'outros', label: 'Outros Bens', icon: Building }
];

const liabilityCategories = [
  { value: 'financiamento_imovel', label: 'Financiamento Imobiliário', icon: Home },
  { value: 'financiamento_veiculo', label: 'Financiamento de Veículo', icon: Car },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'emprestimo_pessoal', label: 'Empréstimo Pessoal', icon: Banknote },
  { value: 'outros', label: 'Outras Dívidas', icon: Building }
];

const ImprovedPatrimonyManager = () => {
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
    totalAssets, 
    totalLiabilities 
  } = usePatrimony();

  const [activeTab, setActiveTab] = useState('assets');
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isLiabilityDialogOpen, setIsLiabilityDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingLiability, setEditingLiability] = useState(null);

  const [assetForm, setAssetForm] = useState({
    name: '',
    category: '',
    current_value: '',
    purchase_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [liabilityForm, setLiabilityForm] = useState({
    name: '',
    category: '',
    total_amount: '',
    remaining_amount: '',
    interest_rate: '',
    monthly_payment: '',
    due_date: '',
    description: ''
  });

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.category || !assetForm.current_value) return;
    
    const assetData = {
      name: assetForm.name,
      category: assetForm.category,
      current_value: parseFloat(assetForm.current_value),
      purchase_value: assetForm.purchase_value ? parseFloat(assetForm.purchase_value) : undefined,
      purchase_date: assetForm.purchase_date,
      description: assetForm.description || undefined
    };

    if (editingAsset) {
      updateAsset({ id: editingAsset.id, ...assetData });
      setEditingAsset(null);
    } else {
      addAsset(assetData);
    }
    
    setAssetForm({
      name: '',
      category: '',
      current_value: '',
      purchase_value: '',
      purchase_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    
    setIsAssetDialogOpen(false);
  };

  const handleLiabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityForm.name || !liabilityForm.category || !liabilityForm.total_amount || !liabilityForm.remaining_amount) return;
    
    const liabilityData = {
      name: liabilityForm.name,
      category: liabilityForm.category,
      total_amount: parseFloat(liabilityForm.total_amount),
      remaining_amount: parseFloat(liabilityForm.remaining_amount),
      interest_rate: liabilityForm.interest_rate ? parseFloat(liabilityForm.interest_rate) : 0,
      monthly_payment: liabilityForm.monthly_payment ? parseFloat(liabilityForm.monthly_payment) : undefined,
      due_date: liabilityForm.due_date || undefined,
      description: liabilityForm.description || undefined
    };

    if (editingLiability) {
      updateLiability({ id: editingLiability.id, ...liabilityData });
      setEditingLiability(null);
    } else {
      addLiability(liabilityData);
    }
    
    setLiabilityForm({
      name: '',
      category: '',
      total_amount: '',
      remaining_amount: '',
      interest_rate: '',
      monthly_payment: '',
      due_date: '',
      description: ''
    });
    
    setIsLiabilityDialogOpen(false);
  };

  const editAsset = (asset: any) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      category: asset.category,
      current_value: asset.current_value.toString(),
      purchase_value: asset.purchase_value?.toString() || '',
      purchase_date: asset.purchase_date || new Date().toISOString().split('T')[0],
      description: asset.description || ''
    });
    setIsAssetDialogOpen(true);
  };

  const editLiability = (liability: any) => {
    setEditingLiability(liability);
    setLiabilityForm({
      name: liability.name,
      category: liability.category,
      total_amount: liability.total_amount.toString(),
      remaining_amount: liability.remaining_amount.toString(),
      interest_rate: liability.interest_rate?.toString() || '',
      monthly_payment: liability.monthly_payment?.toString() || '',
      due_date: liability.due_date || '',
      description: liability.description || ''
    });
    setIsLiabilityDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryIcon = (category: string, isAsset: boolean) => {
    const categories = isAsset ? assetCategories : liabilityCategories;
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || Building;
  };

  const getCategoryLabel = (category: string, isAsset: boolean) => {
    const categories = isAsset ? assetCategories : liabilityCategories;
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.label || category;
  };

  const netWorth = totalAssets - totalLiabilities;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Controle de Patrimônio</h3>
            <p className="text-sm text-gray-600">Gerencie seus ativos e passivos</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total de Ativos</span>
          </div>
          <p className="text-xl font-bold text-green-900">{formatCurrency(totalAssets)}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Total de Passivos</span>
          </div>
          <p className="text-xl font-bold text-red-900">{formatCurrency(totalLiabilities)}</p>
        </div>
        
        <div className={`p-4 rounded-lg ${netWorth >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-sm font-medium ${netWorth >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              Patrimônio Líquido
            </span>
          </div>
          <p className={`text-xl font-bold ${netWorth >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Ativos</TabsTrigger>
          <TabsTrigger value="liabilities">Passivos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Meus Ativos</h4>
            <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ativo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="asset-name">Nome</Label>
                    <Input
                      id="asset-name"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Casa própria, Carro, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="asset-category">Categoria</Label>
                    <Select
                      value={assetForm.category}
                      onValueChange={(value) => setAssetForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="asset-current-value">Valor Atual</Label>
                    <Input
                      id="asset-current-value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={assetForm.current_value}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, current_value: e.target.value }))}
                      placeholder="0.00"
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
                      value={assetForm.purchase_value}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, purchase_value: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-purchase-date">Data da Compra</Label>
                    <Input
                      id="asset-purchase-date"
                      type="date"
                      value={assetForm.purchase_date}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset-description">Descrição (Opcional)</Label>
                    <Input
                      id="asset-description"
                      type="text"
                      value={assetForm.description}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalhes adicionais"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {editingAsset ? 'Atualizar Ativo' : 'Adicionar Ativo'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {assets.map((asset) => {
              const IconComponent = getCategoryIcon(asset.category, true);
              return (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-600">{getCategoryLabel(asset.category, true)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(asset.current_value)}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => editAsset(asset)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteAsset(asset.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="liabilities">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Meus Passivos</h4>
            <Dialog open={isLiabilityDialogOpen} onOpenChange={setIsLiabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Passivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingLiability ? 'Editar Passivo' : 'Novo Passivo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLiabilitySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="liability-name">Nome</Label>
                    <Input
                      id="liability-name"
                      value={liabilityForm.name}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Financiamento casa, Cartão de crédito"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="liability-category">Categoria</Label>
                    <Select
                      value={liabilityForm.category}
                      onValueChange={(value) => setLiabilityForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {liabilityCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
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
                      value={liabilityForm.total_amount}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, total_amount: e.target.value }))}
                      placeholder="0.00"
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
                      value={liabilityForm.remaining_amount}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, remaining_amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-interest">Taxa de Juros (%)</Label>
                    <Input
                      id="liability-interest"
                      type="number"
                      step="0.01"
                      min="0"
                      value={liabilityForm.interest_rate}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, interest_rate: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-payment">Pagamento Mensal (Opcional)</Label>
                    <Input
                      id="liability-payment"
                      type="number"
                      step="0.01"
                      min="0"
                      value={liabilityForm.monthly_payment}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, monthly_payment: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-due-date">Data de Vencimento (Opcional)</Label>
                    <Input
                      id="liability-due-date"
                      type="date"
                      value={liabilityForm.due_date}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="liability-description">Descrição (Opcional)</Label>
                    <Input
                      id="liability-description"
                      type="text"
                      value={liabilityForm.description}
                      onChange={(e) => setLiabilityForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalhes adicionais"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {editingLiability ? 'Atualizar Passivo' : 'Adicionar Passivo'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {liabilities.map((liability) => {
              const IconComponent = getCategoryIcon(liability.category, false);
              return (
                <div key={liability.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{liability.name}</p>
                      <p className="text-sm text-gray-600">{getCategoryLabel(liability.category, false)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(liability.remaining_amount)}</p>
                      {liability.monthly_payment && (
                        <p className="text-sm text-gray-600">
                          {formatCurrency(liability.monthly_payment)}/mês
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => editLiability(liability)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteLiability(liability.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ImprovedPatrimonyManager;
