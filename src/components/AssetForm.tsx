
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const AssetForm = ({
  onSubmit,
  onCancel,
  isLoading,
  editingAsset,
  newAsset,
  setNewAsset,
}: any) => (
  <form onSubmit={onSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
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
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </optgroup>
            <optgroup label="Ativo Não Circulante">
              {assetCategories.nao_circulante.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : editingAsset ? 'Atualizar' : 'Adicionar Ativo'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  </form>
);

export default AssetForm;
