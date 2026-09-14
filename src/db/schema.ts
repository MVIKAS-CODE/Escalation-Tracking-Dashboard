import {
  boolean,
  pgTable,
  serial,
  text,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const escalations = pgTable("escalations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  awbNumber: text("awb_number").notNull(),
  transporterName: text("transporter_name").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  vendorExpectedDeliveryDate: date("vendor_expected_delivery_date"),
  kamName: text("kam_name").notNull(),
  escalationDate: date("escalation_date").notNull(),
  escalationSource: text("escalation_source").notNull(), // WhatsApp / Email / Call
  escalationIssue: text("escalation_issue").notNull(),
  remark: text("remark"),
  status: text("status").notNull().default("Not Resolved"), // Resolved / Not Resolved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Escalation = typeof escalations.$inferSelect;
export type NewEscalation = typeof escalations.$inferInsert;

/**
 * Master data that feeds the Customer / Transporter / KAM dropdowns.
 * Managed by admins; kept in one table with a `kind` discriminator so new
 * dropdown types can be added without schema changes.
 */
export const masterEntries = pgTable(
  "master_entries",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // customer | transporter | kam
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("master_entries_kind_name_idx").on(table.kind, table.name)]
);

export type MasterEntry = typeof masterEntries.$inferSelect;
export type NewMasterEntry = typeof masterEntries.$inferInsert;
