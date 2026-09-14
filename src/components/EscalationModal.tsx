"use client";

import { useState } from "react";
import type { EscalationForm } from "@/lib/types";
import { ESCALATION_SOURCES, STATUSES } from "@/lib/constants";

type Props = {
  initial: EscalationForm;
  isEditing: boolean;
  customers: string[];
  transporters: string[];
  kams: string[];
  onClose: () => void;
  onSave: (form: EscalationForm) => Promise<void>;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

function Options({
  values,
  selected,
  placeholder,
}: {
  values: string[];
  selected: string;
  placeholder: string;
}) {
  return (
    <>
      <option value="">{placeholder}</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
      {selected && !values.includes(selected) && (
        <option value={selected}>{selected} (inactive)</option>
      )}
    </>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <p className="mt-1 text-[11px] text-amber-600">
      No {label} available — add one in{" "}
      <a href="/admin" className="font-medium underline" target="_blank" rel="noreferrer">
        Admin
      </a>
      .
    </p>
  );
}

export default function EscalationModal({
  initial,
  isEditing,
  customers,
  transporters,
  kams,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<EscalationForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof EscalationForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customerName ||
      !form.awbNumber.trim() ||
      !form.transporterName ||
      !form.kamName ||
      !form.escalationDate ||
      !form.escalationSource ||
      !form.escalationIssue.trim()
    ) {
      setError("Please fill in all required fields (marked *).");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Escalation" : "New Escalation"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Customer Name *</label>
              <select
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className={inputClass}
              >
                <Options values={customers} selected={form.customerName} placeholder="Select customer" />
              </select>
              {customers.length === 0 && <EmptyHint label="customers" />}
            </div>

            <div>
              <label className={labelClass}>AWB Number *</label>
              <input
                value={form.awbNumber}
                onChange={(e) => set("awbNumber", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Transporter Name *</label>
              <select
                value={form.transporterName}
                onChange={(e) => set("transporterName", e.target.value)}
                className={inputClass}
              >
                <Options
                  values={transporters}
                  selected={form.transporterName}
                  placeholder="Select transporter"
                />
              </select>
              {transporters.length === 0 && <EmptyHint label="transporters" />}
            </div>

            <div>
              <label className={labelClass}>KAM Name *</label>
              <select
                value={form.kamName}
                onChange={(e) => set("kamName", e.target.value)}
                className={inputClass}
              >
                <Options values={kams} selected={form.kamName} placeholder="Select KAM" />
              </select>
              {kams.length === 0 && <EmptyHint label="KAMs" />}
            </div>

            <div>
              <label className={labelClass}>Escalation Date *</label>
              <input
                type="date"
                value={form.escalationDate}
                onChange={(e) => set("escalationDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Escalation Source *</label>
              <select
                value={form.escalationSource}
                onChange={(e) => set("escalationSource", e.target.value)}
                className={inputClass}
              >
                {ESCALATION_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expected Delivery Date</label>
              <input
                type="date"
                value={form.expectedDeliveryDate}
                onChange={(e) => set("expectedDeliveryDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Vendor Expected Delivery Date</label>
              <input
                type="date"
                value={form.vendorExpectedDeliveryDate}
                onChange={(e) => set("vendorExpectedDeliveryDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Escalation Issue *</label>
              <textarea
                rows={2}
                value={form.escalationIssue}
                onChange={(e) => set("escalationIssue", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Remark</label>
              <textarea
                rows={2}
                value={form.remark}
                onChange={(e) => set("remark", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status *</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
