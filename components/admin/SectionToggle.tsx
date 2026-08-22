"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/admin/actions";

/**
 * Show/hide a whole section on the public website. Writes a single "show_*"
 * flag to the settings table (value "1"/"0") and refreshes so the public page
 * picks it up. The section's content is never deleted — it just stops rendering
 * on the live site while staying fully editable here in the admin.
 */
export function SectionToggle({
  settingKey,
  initialVisible,
}: {
  settingKey: string;
  initialVisible: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(initialVisible);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !visible;
    startTransition(async () => {
      const res = await saveSettings({ [settingKey]: next ? "1" : "0" });
      if (res.error) {
        alert(res.error);
        return;
      }
      setVisible(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-white border border-line rounded-md px-5 py-4 mb-6">
      <div>
        <p className="font-util text-[0.62rem] tracking-[0.16em] uppercase text-muted">
          On the website
        </p>
        <p className="font-display text-lg mt-0.5">
          {visible ? (
            <span className="text-teal">Showing on the website</span>
          ) : (
            <span className="text-burgundy">Hidden from the website</span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={visible}
        title={visible ? "Hide from website" : "Show on website"}
        className={`relative inline-flex h-8 w-16 shrink-0 items-center rounded-full border transition ${
          visible ? "bg-teal border-teal" : "bg-sand border-line"
        } ${pending ? "opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
            visible ? "translate-x-9" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
