export const ESCALATION_SOURCES = ["WhatsApp", "Email", "Call"] as const;
export const STATUSES = ["Resolved", "Not Resolved"] as const;

export type EscalationSource = (typeof ESCALATION_SOURCES)[number];
export type Status = (typeof STATUSES)[number];

/** Dropdown master-data types managed from the Admin screen. */
export const MASTER_KINDS = ["customer", "transporter", "kam"] as const;

export type MasterKind = (typeof MASTER_KINDS)[number];

export const MASTER_LABELS: Record<MasterKind, string> = {
  customer: "Customer",
  transporter: "Transporter",
  kam: "KAM",
};

export const MASTER_LABELS_PLURAL: Record<MasterKind, string> = {
  customer: "Customers",
  transporter: "Transporters",
  kam: "KAMs",
};

export type MasterMap = Record<MasterKind, string[]>;
