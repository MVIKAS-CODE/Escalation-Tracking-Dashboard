"use client";

import { useCallback, useEffect, useState } from "react";
import type { MasterEntry } from "@/lib/types";
import {
  MASTER_KINDS,
  MASTER_LABELS,
  MASTER_LABELS_PLURAL,
  type MasterKind,
} from "@/lib/constants";

type Usage = Record<string, Record<string, number>>;

async function callApi(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data;
}

export default function AdminPanel() {
  const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [usage, setUsage] = useState<Usage>({ customer: {}, transporter: {}, kam: {} });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<MasterKind, string>>({
    customer: "",
    transporter: "",
    kam: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, use] = await Promise.all([
        callApi("/api/masters") as Promise<MasterEntry[]>,
        callApi("/api/masters/usage") as Promise<{ usage: Usage }>,
      ]);
      setEntries(Array.isArray(list) ? list : []);
      setUsage(use?.usage ?? { customer: {}, transporter: {}, kam: {} });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(kind: MasterKind) {
    const name = drafts[kind].trim();
    if (!name) {
      setMessage({ kind: "error", text: `Enter a ${MASTER_LABELS[kind].toLowerCase()} name first.` });
      return;
    }
    try {
      await callApi("/api/masters", { method: "POST", body: JSON.stringify({ kind, name }) });
      setDrafts((d) => ({ ...d, [kind]: "" }));
      setMessage({ kind: "ok", text: `Added "${name}" to ${MASTER_LABELS_PLURAL[kind]}.` });
      await load();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to add" });
    }
  }

  async function toggleActive(entry: MasterEntry) {
    setBusyId(entry.id);
    try {
      await callApi(`/api/masters/${entry.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      setMessage({
        kind: "ok",
        text: entry.isActive
          ? `"${entry.name}" deactivated — it will no longer appear in dropdowns.`
          : `"${entry.name}" activated.`,
      });
      await load();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to update" });
    } finally {
      setBusyId(null);
    }
  }

  async function saveRename(entry: MasterEntry) {
    const name = editName.trim();
    if (!name || name === entry.name) {
      setEditingId(null);
      return;
    }
    setBusyId(entry.id);
    try {
      await callApi(`/api/masters/${entry.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setEditingId(null);
      setMessage({ kind: "ok", text: `Renamed to "${name}".` });
      await load();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to rename" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(entry: MasterEntry) {
    if (!confirm(`Delete "${entry.name}" from ${MASTER_LABELS_PLURAL[entry.kind as MasterKind]}?`)) {
      return;
    }
    setBusyId(entry.id);
    try {
      await callApi(`/api/masters/${entry.id}`, { method: "DELETE" });
      setMessage({ kind: "ok", text: `Deleted "${entry.name}".` });
      await load();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to delete" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin — Master Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the dropdown options used for Customer, Transporter and KAM.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to Dashboard
        </a>
      </header>

      {/*
        AUTH PLACEHOLDER: when the admin role login is ready, gate this page
        (server-side in src/app/admin/page.tsx) and set `createdBy` here.
      */}

      {message && (
        <div
          className={`mt-6 rounded-lg px-4 py-3 text-sm ring-1 ${
            message.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-rose-50 text-rose-800 ring-rose-200"
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-3 font-semibold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-center text-sm text-slate-400">Loading master data…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {MASTER_KINDS.map((kind) => {
            const list = entries.filter((e) => e.kind === kind);
            const active = list.filter((e) => e.isActive);
            return (
              <section
                key={kind}
                className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">
                    {MASTER_LABELS_PLURAL[kind]}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {active.length} active / {list.length} total
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={drafts[kind]}
                    onChange={(e) => setDrafts((d) => ({ ...d, [kind]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addEntry(kind);
                    }}
                    placeholder={`Add ${MASTER_LABELS[kind].toLowerCase()}…`}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => addEntry(kind)}
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>

                <ul className="mt-4 divide-y divide-slate-100">
                  {list.length === 0 && (
                    <li className="py-4 text-sm text-slate-400">
                      No {MASTER_LABELS_PLURAL[kind].toLowerCase()} yet.
                    </li>
                  )}
                  {list.map((entry) => {
                    const used = usage[entry.kind]?.[entry.name] ?? 0;
                    const busy = busyId === entry.id;
                    return (
                      <li key={entry.id} className="flex items-center gap-2 py-2.5">
                        <button
                          onClick={() => toggleActive(entry)}
                          disabled={busy}
                          title={entry.isActive ? "Active — shown in dropdowns" : "Inactive — hidden"}
                          className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                            entry.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                              entry.isActive ? "left-4" : "left-0.5"
                            }`}
                          />
                        </button>

                        {editingId === entry.id ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(entry);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full rounded-md border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span
                            className={`w-full truncate text-sm ${
                              entry.isActive ? "text-slate-800" : "text-slate-400 line-through"
                            }`}
                            title={entry.name}
                          >
                            {entry.name}
                          </span>
                        )}

                        <span
                          className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                          title={`Used in ${used} escalation(s)`}
                        >
                          {used}
                        </span>

                        {editingId === entry.id ? (
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() => saveRename(entry)}
                              disabled={busy}
                              className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() => {
                                setEditingId(entry.id);
                                setEditName(entry.name);
                              }}
                              className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => remove(entry)}
                              disabled={busy}
                              className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Tip: deactivating an entry hides it from dropdowns but keeps historical escalations intact.
        Deleting is blocked while the entry is still referenced.
      </p>
    </div>
  );
}
