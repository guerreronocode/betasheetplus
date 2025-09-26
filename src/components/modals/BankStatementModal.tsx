import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BankStatementUpload from '@/components/BankStatementUpload';
import BankStatementHistory from '@/components/BankStatementHistory';

interface BankStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BankStatementModal = ({ open, onOpenChange }: BankStatementModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Extrato Bancário</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Extrato</TabsTrigger>
            <TabsTrigger value="history">Histórico de Uploads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-4">
            <BankStatementUpload />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <BankStatementHistory />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BankStatementModal;