
import React from "react";
import { Card } from "@/components/ui/card";

interface Props {
  children?: React.ReactNode;
}
const InvestmentManagerHeader: React.FC<Props> = ({ children }) => (
  <Card className="p-6 mb-4">
    <h3 className="text-lg font-semibold">Gerenciar Investimentos</h3>
    {children}
  </Card>
);
export default InvestmentManagerHeader;

