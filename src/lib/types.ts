export type Escalation = {
  id: number;
  customerName: string;
  awbNumber: string;
  transporterName: string;
  expectedDeliveryDate: string | null;
  vendorExpectedDeliveryDate: string | null;
  kamName: string;
  escalationDate: string;
  escalationSource: string;
  escalationIssue: string;
  remark: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MasterEntry = {
  id: number;
  kind: string;
  name: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EscalationForm = {
  customerName: string;
  awbNumber: string;
  transporterName: string;
  expectedDeliveryDate: string;
  vendorExpectedDeliveryDate: string;
  kamName: string;
  escalationDate: string;
  escalationSource: string;
  escalationIssue: string;
  remark: string;
  status: string;
};
