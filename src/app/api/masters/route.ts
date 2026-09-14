import { db } from "@/db";
import { masterEntries } from "@/db/schema";
import { MASTER_KINDS, type MasterKind } from "@/lib/constants";
import { and, asc, eq, inArray, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kindParam = searchParams.get("kind");
  const activeOnly = searchParams.get("activeOnly") === "true";

  const conditions: SQL[] = [];

  if (kindParam) {
    const kinds = kindParam
      .split(",")
      .map((k) => k.trim())
      .filter((k): k is MasterKind => (MASTER_KINDS as readonly string[]).includes(k));
    if (kinds.length) conditions.push(inArray(masterEntries.kind, kinds));
  }

  if (activeOnly) conditions.push(eq(masterEntries.isActive, true));

  const rows = await db
    .select()
    .from(masterEntries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(masterEntries.kind), asc(masterEntries.name));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  const kind = String(body.kind ?? "").trim();
  const name = String(body.name ?? "").trim();

  if (!(MASTER_KINDS as readonly string[]).includes(kind)) {
    return Response.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(masterEntries)
    .where(and(eq(masterEntries.kind, kind), eq(masterEntries.name, name)))
    .limit(1);

  if (existing) {
    return Response.json(
      { error: `"${name}" already exists in ${kind}.`, entry: existing },
      { status: 409 }
    );
  }

  const [row] = await db
    .insert(masterEntries)
    .values({
      kind,
      name,
      isActive: body.isActive === false ? false : true,
      createdBy: body.createdBy ? String(body.createdBy) : null,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
