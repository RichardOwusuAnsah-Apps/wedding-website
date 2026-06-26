import { createClient } from "@/lib/supabase/server";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-line rounded-md p-7">
      <div className="font-display text-5xl text-teal leading-none">{value}</div>
      <div className="font-util text-[0.66rem] tracking-[0.2em] uppercase text-muted mt-3">
        {label}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [rsvps, pending] = await Promise.all([
    supabase.from("rsvps").select("*", { count: "exact", head: true }),
    supabase
      .from("guestbook")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl text-burgundy">Dashboard</h1>
      <p className="text-muted mt-2 mb-8">
        Manage your wedding site content, RSVPs, and guestbook here.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
        <StatCard label="RSVPs received" value={rsvps.count ?? 0} />
        <StatCard label="Wishes awaiting approval" value={pending.count ?? 0} />
      </div>

      <p className="text-muted mt-10 font-util text-[0.72rem] tracking-[0.12em] uppercase">
        <span className="md:hidden">Tap ☰ Menu (top-left) </span>
        <span className="hidden md:inline">Use the sidebar </span>
        to manage every section.
      </p>
    </div>
  );
}
