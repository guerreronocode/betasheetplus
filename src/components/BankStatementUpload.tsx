import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useBankStatementUploads } from '@/hooks/useBankStatementUploads';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BankStatementUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const { createUpload, isCreatingUpload } = useBankStatementUploads();
  const { bankAccounts } = useBankAccounts();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.name.toLowerCase().endsWith('.ofx')) {
      setFile(selectedFile);
      if (!uploadName) {
        const fileName = selectedFile.name.replace('.ofx', '');
        setUploadName(fileName);
      }
    } else {
      alert('Por favor, selecione um arquivo OFX.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !uploadName.trim()) {
      alert('Por favor, selecione um arquivo e informe um nome para o upload.');
      return;
    }

    try {
      const fileContent = await file.text();
      createUpload({
        uploadName: uploadName.trim(),
        fileContent,
        bankAccountId: selectedAccountId || undefined
      });
      
      // Limpar formulário após sucesso
      setFile(null);
      setUploadName('');
      setSelectedAccountId('');
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upload de Extrato Bancário</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${file ? 'bg-muted/20' : 'hover:bg-muted/10'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado - {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remover arquivo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium mb-1">
                  Arraste um arquivo OFX aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Apenas arquivos .ofx são suportados
                </p>
              </div>
              <input
                type="file"
                accept=".ofx"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
                id="file-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Selecionar arquivo
              </Button>
            </div>
          )}
        </div>

        {/* Nome do upload */}
        <div className="space-y-2">
          <Label htmlFor="uploadName">Nome do Upload</Label>
          <Input
            id="uploadName"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
            placeholder="Ex: Extrato Nubank Janeiro 2024"
            required
          />
        </div>

        {/* Conta bancária (opcional) */}
        <div className="space-y-2">
          <Label>Conta Bancária (Opcional)</Label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma conta específica</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {account.bank_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Se não selecionada, as transações não afetarão o saldo de nenhuma conta
          </p>
        </div>

        {/* Aviso importante */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• O arquivo não será armazenado, apenas processado</li>
              <li>• As transações serão categorizadas como "Upload extrato bancário"</li>
              <li>• Valores positivos viram receitas, negativos viram despesas</li>
            </ul>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={!file || !uploadName.trim() || isCreatingUpload}
        >
          {isCreatingUpload ? 'Processando...' : 'Processar Upload'}
        </Button>
      </form>
    </Card>
  );
};

export default BankStatementUpload;