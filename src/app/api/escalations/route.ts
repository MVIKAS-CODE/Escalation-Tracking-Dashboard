import { db } from "@/db";
import { escalations } from "@/db/schema";
import { and, desc, eq, gte, lte, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

function emptyToNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const conditions: SQL[] = [];

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const customer = searchParams.get("customer");
  const transporter = searchParams.get("transporter");
  const kam = searchParams.get("kam");
  const source = searchParams.get("source");
  const status = searchParams.get("status");

  if (from) conditions.push(gte(escalations.escalationDate, from));
  if (to) conditions.push(lte(escalations.escalationDate, to));
  // Customer / Transporter / KAM are dropdown-driven, so match exactly.
  if (customer) conditions.push(eq(escalations.customerName, customer));
  if (transporter) conditions.push(eq(escalations.transporterName, transporter));
  if (kam) conditions.push(eq(escalations.kamName, kam));
  if (source) conditions.push(eq(escalations.escalationSource, source));
  if (status) conditions.push(eq(escalations.status, status));

  const rows = await db
    .select()
    .from(escalations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(escalations.escalationDate), desc(escalations.id));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.customerName || !body.awbNumber || !body.transporterName || !body.kamName || !body.escalationDate || !body.escalationSource || !body.escalationIssue) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db
    .insert(escalations)
    .values({
      customerName: String(body.customerName).trim(),
      awbNumber: String(body.awbNumber).trim(),
      transporterName: String(body.transporterName).trim(),
      expectedDeliveryDate: emptyToNull(body.expectedDeliveryDate),
      vendorExpectedDeliveryDate: emptyToNull(body.vendorExpectedDeliveryDate),
      kamName: String(body.kamName).trim(),
      escalationDate: String(body.escalationDate),
      escalationSource: String(body.escalationSource),
      escalationIssue: String(body.escalationIssue).trim(),
      remark: emptyToNull(body.remark),
      status: body.status === "Resolved" ? "Resolved" : "Not Resolved",
    })
    .returning();

  return Response.json(row, { status: 201 });
}
