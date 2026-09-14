"use client";

import { useCallback, useEffect, useState } from "react";
import { MASTER_KINDS, type MasterKind, type MasterMap } from "@/lib/constants";

const EMPTY: MasterMap = { customer: [], transporter: [], kam: [] };

/** Loads the active dropdown options for Customer / Transporter / KAM. */
export function useMasters() {
  const [options, setOptions] = useState<MasterMap>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/masters?activeOnly=true&kind=${MASTER_KINDS.join(",")}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const next: MasterMap = { customer: [], transporter: [], kam: [] };
      if (Array.isArray(data)) {
        for (const row of data) {
          const kind = row?.kind as MasterKind;
          if (kind && Object.prototype.hasOwnProperty.call(next, kind)) {
            next[kind].push(String(row.name));
          }
        }
      }
      setOptions(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { options, loading, reload: load };
}
