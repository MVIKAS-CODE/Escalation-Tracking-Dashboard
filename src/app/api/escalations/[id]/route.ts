import { db } from "@/db";
import { escalations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function emptyToNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();

  const [row] = await db
    .update(escalations)
    .set({
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
      updatedAt: sql`now()`,
    })
    .where(eq(escalations.id, numId))
    .returning();

  if (!row) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(row);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(escalations).where(eq(escalations.id, numId));
  return Response.json({ ok: true });
}
