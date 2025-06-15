
import React from "react";
import { patrimonyGroupLabels } from "./patrimonyCategories";

interface Props {
  selectedGroup: string | null;
}

const PatrimonyGroupSelector: React.FC<Props> = ({ selectedGroup }) =>
  selectedGroup ? (
    <div className="font-semibold mb-1">
      {patrimonyGroupLabels[selectedGroup]}
    </div>
  ) : null;

export default PatrimonyGroupSelector;
