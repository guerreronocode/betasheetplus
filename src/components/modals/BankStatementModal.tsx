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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base">Extrato Bancário</DialogTitle>
        </DialogHeader>
        <div className="[&_label]:text-xs [&_input]:h-7 [&_button]:h-7 [&_.space-y-4]:space-y-2 [&_.space-y-3]:space-y-2">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-2">
              <BankStatementUpload />
            </TabsContent>
            
            <TabsContent value="history" className="mt-2">
              <BankStatementHistory />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankStatementModal;