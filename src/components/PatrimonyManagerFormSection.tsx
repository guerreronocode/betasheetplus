
import React from "react";
import PatrimonyFormContainer from "./PatrimonyFormContainer";

interface Props {
  entryType: "asset" | "liability";
  setEntryType: (val: "asset" | "liability") => void;
  onResetForm: () => void;
  selectedGroup: string | null;
  patrimonyCategoryRules: Record<string, string>;
  form: any;
  setForm: (f: any) => void;
  investments: any[];
  bankAccounts: any[];
  debts: any[];
  isAddingAsset: boolean;
  isAddingLiability: boolean;
  addAsset: any;
  updateAsset: any;
  deleteAsset: any;
  addLiability: any;
  updateLiability: any;
  deleteLiability: any;
}

const PatrimonyManagerFormSection: React.FC<Props> = (props) => (
  <PatrimonyFormContainer {...props} />
);

export default React.memo(PatrimonyManagerFormSection);
