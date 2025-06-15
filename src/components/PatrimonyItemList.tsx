
import React from "react";
import PatrimonyItem from "./PatrimonyItem";

// Mantém props iguais
interface PatrimonyItemListProps {
  items: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

const PatrimonyItemList: React.FC<PatrimonyItemListProps> = ({ items, onEdit, onDelete }) => (
  <div className="space-y-2">
    {items.length === 0 && <span className="text-gray-400">Nenhum item cadastrado.</span>}
    {items.map((item) => (
      <PatrimonyItem key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
    ))}
  </div>
);

// React.memo para evitar rerenders se props não mudarem
export default React.memo(PatrimonyItemList);
