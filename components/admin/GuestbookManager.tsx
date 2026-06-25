"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setGuestbookStatus, deleteRow } from "@/lib/admin/actions";
import type { GuestbookEntry } from "@/lib/types";

function Entry({ entry }: { entry: GuestbookEntry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const approved = entry.status === "approved";

  return (
    <li className="bg-white border border-line rounded-md px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="italic text-ink/90">&ldquo;{entry.message}&rdquo;</p>
          <p className="font-util text-[0.64rem] tracking-[0.16em] uppercase text-gold mt-2">
            — {entry.name}
            <span
              className={`ml-3 ${approved ? "text-teal" : "text-muted"}`}
            >
              {approved ? "Approved" : "Pending"}
            </span>
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <button
            className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-teal"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setGuestbookStatus(
                  entry.id,
                  approved ? "pending" : "approved",
                );
                router.refresh();
              })
            }
          >
            {approved ? "Unapprove" : "Approve"}
          </button>
          <button
            className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-burgundy"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this wish?")) return;
              startTransition(async () => {
                await deleteRow("guestbook", entry.id);
                router.refresh();
              });
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export function GuestbookManager({ entries }: { entries: GuestbookEntry[] }) {
  const pending = entries.filter((e) => e.status !== "approved");
  const approved = entries.filter((e) => e.status === "approved");

  return (
    <div>
      <h1 className="font-display text-4xl text-burgundy mb-6">Guestbook</h1>

      <h2 className="font-util text-[0.72rem] tracking-[0.18em] uppercase text-muted mb-3">
        Pending ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="text-muted mb-8">Nothing awaiting approval.</p>
      ) : (
        <ul className="flex flex-col gap-3 mb-8">
          {pending.map((e) => (
            <Entry key={e.id} entry={e} />
          ))}
        </ul>
      )}

      <h2 className="font-util text-[0.72rem] tracking-[0.18em] uppercase text-muted mb-3">
        Approved ({approved.length})
      </h2>
      {approved.length === 0 ? (
        <p className="text-muted">No approved wishes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {approved.map((e) => (
            <Entry key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </div>
  );
}
