import { db } from "@/db";
import { escalations } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Returns how many escalations reference each customer / transporter / KAM,
 * so the admin screen can warn before renaming or deleting a master entry.
 */
export async function GET() {
  const rows = await db
    .select({
      customer: escalations.customerName,
      transporter: escalations.transporterName,
      kam: escalations.kamName,
    })
    .from(escalations);

  const usage: Record<string, Record<string, number>> = {
    customer: {},
    transporter: {},
    kam: {},
  };

  const bump = (kind: string, name: string | null) => {
    if (!name) return;
    usage[kind][name] = (usage[kind][name] ?? 0) + 1;
  };

  for (const r of rows) {
    bump("customer", r.customer);
    bump("transporter", r.transporter);
    bump("kam", r.kam);
  }

  const total = await db.select({ count: sql<number>`count(*)::int` }).from(escalations);

  return Response.json({ usage, totalEscalations: total[0]?.count ?? 0 });
}
