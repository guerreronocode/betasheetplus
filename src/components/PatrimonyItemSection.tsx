
import React from "react";
import PatrimonyItemList from "./PatrimonyItemList";
import PatrimonyGroupSelector from "./PatrimonyGroupSelector";

interface PatrimonyItemSectionProps {
  groupKey: string;
  groupLabel: string;
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const PatrimonyItemSection: React.FC<PatrimonyItemSectionProps> = ({
  groupKey,
  groupLabel,
  items,
  onEdit,
  onDelete
}) => {
  return (
    <div className="mb-6">
      <PatrimonyGroupSelector selectedGroup={groupKey} />
      <PatrimonyItemList items={items} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

// React.memo para evitar rerenders se props não mudarem
export default React.memo(PatrimonyItemSection);
