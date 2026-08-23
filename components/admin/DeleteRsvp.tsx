"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteRow } from "@/lib/admin/actions";

/**
 * Removes a whole RSVP submission. A +1 has no row of its own — they are a
 * column on the guest who brought them — so the confirmation names both people
 * to make clear that deleting takes the pair.
 */
export function DeleteRsvp({
  id,
  name,
  guestName,
}: {
  id: string;
  name: string;
  guestName: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const question = guestName
    ? `Delete the RSVP from ${name}? This also removes their +1, ${guestName}.`
    : `Delete the RSVP from ${name}?`;

  return (
    <button
      className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-burgundy disabled:opacity-40"
      disabled={pending}
      onClick={() => {
        if (!confirm(question)) return;
        startTransition(async () => {
          const res = await deleteRow("rsvps", id);
          if (res.error) alert(`Could not delete: ${res.error}`);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
