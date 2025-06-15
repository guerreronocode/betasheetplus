
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InvestmentForm from "./InvestmentForm";
import InvestmentList from "./InvestmentList";

interface Props {
  isAddingNew: boolean;
  setIsAddingNew: (v: boolean) => void;
  editingInvestment: any;
  setEditingInvestment: (inv: any) => void;
  newInvestment: any;
  setNewInvestment: (form: any) => void;
  isAddingInvestment: boolean;
  handleInvestmentFormSubmit: (data: any) => void;
  bankAccounts: any;
  yieldRates: any;
  investments: any;
  handleEdit: (inv: any) => void;
  handleDelete: (id: string) => void;
}
const emptyInvestment = {
  name: '',
  type: 'stocks',
  amount: '',
  yield_type: 'fixed',
  yield_rate: '',
  yield_extra: '',
  yield_percent_index: '',
  purchase_date: new Date().toISOString().split('T')[0],
  bank_account_id: 'none',
  category: 'other',
};

const ManageInvestmentCard: React.FC<Props> = ({
  isAddingNew,
  setIsAddingNew,
  editingInvestment,
  setEditingInvestment,
  newInvestment,
  setNewInvestment,
  isAddingInvestment,
  handleInvestmentFormSubmit,
  bankAccounts,
  yieldRates,
  investments,
  handleEdit,
  handleDelete,
}) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <span />
      <Button onClick={() => {
        setIsAddingNew(!isAddingNew);
        if (isAddingNew) {
          setEditingInvestment(null);
          setNewInvestment({ ...emptyInvestment });
        }
      }}>
        <Plus className="w-4 h-4 mr-2" />
        {editingInvestment ? "Cancelar Edição" : "Novo Investimento"}
      </Button>
    </div>
    {isAddingNew && (
      <InvestmentForm
        isAdding={isAddingInvestment}
        isEditing={!!editingInvestment}
        initialValues={
          editingInvestment
            ? { ...newInvestment, id: editingInvestment.id }
            : newInvestment
        }
        bankAccounts={bankAccounts}
        yieldRates={yieldRates}
        onSubmit={handleInvestmentFormSubmit}
        onCancel={() => {
          setIsAddingNew(false);
          setEditingInvestment(null);
          setNewInvestment({ ...emptyInvestment });
        }}
      />
    )}
    <InvestmentList
      investments={investments}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  </div>
);
export default ManageInvestmentCard;

