
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { assetCategoryOptions, liabilityCategoryOptions } from "./ImprovedPatrimonyManager";

interface PatrimonyItemProps {
  item: any;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

const getCategoryLabel = (category: string) => {
  return (assetCategoryOptions.concat(liabilityCategoryOptions).find(opt => opt.value === category)?.label) || category;
};

const PatrimonyItem: React.FC<PatrimonyItemProps> = ({ item, onEdit, onDelete }) => (
  <div className="flex items-center justify-between px-3 py-2 bg-white border rounded">
    <div>
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-gray-500 ml-2">
        Categoria: {getCategoryLabel(item.category)}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-semibold">
        {(item.current_value ?? item.remaining_amount ?? 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </span>
      {item.current_value !== undefined && onEdit && (
        <Button size="icon" variant="outline" onClick={() => onEdit(item)}>
          <Edit className="w-4 h-4" />
        </Button>
      )}
      {(item.current_value !== undefined || item.remaining_amount !== undefined) && onDelete && (
        <Button size="icon" variant="outline" onClick={() => onDelete(item.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

export default PatrimonyItem;
