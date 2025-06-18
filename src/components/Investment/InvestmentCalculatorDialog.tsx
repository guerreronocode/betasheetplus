
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import InvestmentCalculator from './InvestmentCalculator';

const InvestmentCalculatorDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Calculadora
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <InvestmentCalculator onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentCalculatorDialog;
