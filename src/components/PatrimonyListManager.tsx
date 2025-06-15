
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface ListProps {
  title: string;
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  valueKey: string;
  valueColor: string;
  currencyFormatter: (value: number) => string;
  valueLabel?: string;
}

const PatrimonyListManager: React.FC<ListProps> = ({
  title,
  items,
  onEdit,
  onDelete,
  valueKey,
  valueColor,
  currencyFormatter,
  valueLabel = "",
}) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {items.map((item) => (
      <Card key={item.id} className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.category}</p>
            <p className={`text-lg font-semibold ${valueColor}`}>
              {currencyFormatter(item[valueKey])}
            </p>
            {valueLabel && item.total_amount !== undefined && (
              <p className="text-sm text-gray-500">
                {valueLabel}: {currencyFormatter(item.total_amount)}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default PatrimonyListManager;
