import { db } from "@/db";
import { escalations, masterEntries } from "@/db/schema";
import { MASTER_KINDS } from "@/lib/constants";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Maps a master kind to the escalation column that references it. */
const KIND_TO_COLUMN = {
  customer: escalations.customerName,
  transporter: escalations.transporterName,
  kam: escalations.kamName,
} as const;

async function usageCount(kind: string, name: string): Promise<number> {
  const column = KIND_TO_COLUMN[kind as keyof typeof KIND_TO_COLUMN];
  if (!column) return 0;
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(escalations)
    .where(eq(column, name));
  return row?.count ?? 0;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();

  const [current] = await db.select().from(masterEntries).where(eq(masterEntries.id, numId)).limit(1);
  if (!current) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const kind = String(body.kind ?? current.kind).trim();
  const name = String(body.name ?? current.name).trim();

  if (!(MASTER_KINDS as readonly string[]).includes(kind)) {
    return Response.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [duplicate] = await db
    .select()
    .from(masterEntries)
    .where(
      and(
        eq(masterEntries.kind, kind),
        eq(masterEntries.name, name),
        sql`${masterEntries.id} <> ${numId}`
      )
    )
    .limit(1);

  if (duplicate) {
    return Response.json({ error: `"${name}" already exists in ${kind}.` }, { status: 409 });
  }

  const renamed = current.name !== name || current.kind !== kind;
  const usages = renamed ? await usageCount(current.kind, current.name) : 0;

  if (renamed && usages > 0) {
    return Response.json(
      {
        error: `"${current.name}" is used in ${usages} escalation(s). Deactivate it instead of renaming, or rename those records first.`,
      },
      { status: 409 }
    );
  }

  const [row] = await db
    .update(masterEntries)
    .set({
      kind,
      name,
      isActive: body.isActive === undefined ? current.isActive : body.isActive !== false,
      updatedAt: sql`now()`,
    })
    .where(eq(masterEntries.id, numId))
    .returning();

  return Response.json(row);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const [current] = await db.select().from(masterEntries).where(eq(masterEntries.id, numId)).limit(1);
  if (!current) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const usages = await usageCount(current.kind, current.name);
  if (usages > 0) {
    return Response.json(
      {
        error: `Cannot delete "${current.name}" — it is referenced by ${usages} escalation(s). Deactivate it instead.`,
      },
      { status: 409 }
    );
  }

  await db.delete(masterEntries).where(eq(masterEntries.id, numId));
  return Response.json({ ok: true });
}
