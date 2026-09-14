"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Escalation, EscalationForm } from "@/lib/types";
import { ESCALATION_SOURCES, STATUSES } from "@/lib/constants";
import { useMasters } from "@/lib/use-masters";
import StatCards from "./StatCards";
import BreakdownGrid from "./BreakdownGrid";
import Filters, { FilterState } from "./Filters";
import EscalationTable from "./EscalationTable";
import EscalationModal from "./EscalationModal";

const emptyFilters: FilterState = {
  from: "",
  to: "",
  customer: "",
  transporter: "",
  kam: "",
  source: "",
  status: "",
};

const emptyForm: EscalationForm = {
  customerName: "",
  awbNumber: "",
  transporterName: "",
  expectedDeliveryDate: "",
  vendorExpectedDeliveryDate: "",
  kamName: "",
  escalationDate: new Date().toISOString().slice(0, 10),
  escalationSource: "WhatsApp",
  escalationIssue: "",
  remark: "",
  status: "Not Resolved",
};

export default function Dashboard() {
  const [rows, setRows] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Escalation | null>(null);

  // Dropdown master data for Customer / Transporter / KAM (managed in /admin)
  const { options } = useMasters();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const res = await fetch(`/api/escalations?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const stats = useMemo(() => {
    const total = rows.length;
    const resolved = rows.filter((r) => r.status === "Resolved").length;
    const pending = total - resolved;
    const overdue = rows.filter(
      (r) => r.status !== "Resolved" && r.expectedDeliveryDate && r.expectedDeliveryDate < today
    ).length;
    return { total, resolved, pending, overdue };
  }, [rows, today]);

  const bySource = useMemo(() => groupCount(rows, (r) => r.escalationSource), [rows]);
  const byTransporter = useMemo(() => groupCount(rows, (r) => r.transporterName), [rows]);
  const byKam = useMemo(() => groupCount(rows, (r) => r.kamName), [rows]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Escalation) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSave(form: EscalationForm) {
    if (editing) {
      await fetch(`/api/escalations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`/api/escalations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this escalation?")) return;
    await fetch(`/api/escalations/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggleStatus(row: Escalation) {
    const next = row.status === "Resolved" ? "Not Resolved" : "Resolved";
    await fetch(`/api/escalations/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, status: next }),
    });
    await load();
  }

  const initialForm: EscalationForm = editing
    ? {
        customerName: editing.customerName,
        awbNumber: editing.awbNumber,
        transporterName: editing.transporterName,
        expectedDeliveryDate: editing.expectedDeliveryDate ?? "",
        vendorExpectedDeliveryDate: editing.vendorExpectedDeliveryDate ?? "",
        kamName: editing.kamName,
        escalationDate: editing.escalationDate,
        escalationSource: editing.escalationSource,
        escalationIssue: editing.escalationIssue,
        remark: editing.remark ?? "",
        status: editing.status,
      }
    : emptyForm;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Escalation Tracking Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor customer delivery escalations and resolution status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Admin
          </a>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <span className="text-lg leading-none">+</span> New Escalation
          </button>
        </div>
      </header>

      <div className="mt-6">
        <StatCards stats={stats} />
      </div>

      <div className="mt-6">
        <BreakdownGrid bySource={bySource} byTransporter={byTransporter} byKam={byKam} />
      </div>

      <div className="mt-6">
        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
          sources={[...ESCALATION_SOURCES]}
          statuses={[...STATUSES]}
          customers={options.customer}
          transporters={options.transporter}
          kams={options.kam}
        />
      </div>

      <div className="mt-6">
        <EscalationTable
          rows={rows}
          loading={loading}
          today={today}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={toggleStatus}
        />
      </div>

      {modalOpen && (
        <EscalationModal
          initial={initialForm}
          isEditing={!!editing}
          customers={options.customer}
          transporters={options.transporter}
          kams={options.kam}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function groupCount(rows: Escalation[], key: (r: Escalation) => string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r) || "—";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
