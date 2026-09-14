import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Master Data | Escalation Tracking",
  description: "Manage Customer, Transporter and KAM dropdown options.",
};

// NOTE: wire the admin-role login/session check in here (server-side) when ready.
export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AdminPanel />
    </main>
  );
}
