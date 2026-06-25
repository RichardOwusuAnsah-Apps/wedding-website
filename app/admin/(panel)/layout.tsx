import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — proxy.ts already guards, but never render the panel
  // without a verified session.
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between gap-4 px-7 py-4 bg-white border-b border-line">
        <Link href="/admin" className="brand text-[1.2rem]">
          R <b>&amp;</b> S
          <span className="font-util text-[0.62rem] tracking-[0.2em] uppercase text-muted ml-2">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="font-util text-[0.68rem] tracking-[0.16em] uppercase text-muted hover:text-burgundy"
          >
            View site ↗
          </Link>
          <span className="font-util text-[0.68rem] tracking-[0.12em] text-muted hidden sm:inline">
            {user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="font-util text-[0.68rem] tracking-[0.16em] uppercase border border-line rounded-[2px] px-3 py-2 text-burgundy hover:bg-sand transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 w-full">
        <aside className="hidden md:block w-56 shrink-0 border-r border-line bg-white/60 px-4 py-7">
          <AdminNav />
        </aside>
        <main className="flex-1 px-7 py-10 max-w-5xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
