
import React from "react";
import PatrimonyItemSection from "./PatrimonyItemSection";
import { patrimonyGroupLabels } from "./patrimonyCategories";

interface Props {
  selectedGroup: string;
  groups: Record<string, any[]>;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const PatrimonyListSection: React.FC<Props> = ({
  selectedGroup,
  groups,
  onEdit,
  onDelete
}) => (
  <PatrimonyItemSection
    groupKey={selectedGroup}
    groupLabel={patrimonyGroupLabels[selectedGroup]}
    items={groups[selectedGroup]}
    onEdit={onEdit}
    onDelete={onDelete}
  />
);

export default React.memo(PatrimonyListSection);
