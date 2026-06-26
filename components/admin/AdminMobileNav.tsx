"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV_ITEMS, isNavActive } from "@/lib/admin/nav";

/** Phone-only admin menu: a button in the top bar opens a dropdown of sections. */
export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ADMIN_NAV_ITEMS.find(([href]) => isNavActive(href, pathname));

  return (
    <div className="md:hidden relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Admin menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-util text-[0.66rem] tracking-[0.14em] uppercase text-burgundy border border-line rounded-[2px] px-3 py-2"
      >
        <span className="text-base leading-none">☰</span>
        {current ? current[1] : "Menu"}
      </button>

      {open && (
        <>
          {/* backdrop to close on outside tap */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-full mt-2 z-50 w-56 max-h-[70vh] overflow-y-auto bg-white border border-line rounded-md shadow-lg py-1.5 flex flex-col">
            {ADMIN_NAV_ITEMS.map(([href, label]) => {
              const active = isNavActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`font-util text-[0.72rem] tracking-[0.12em] uppercase px-4 py-2.5 transition ${
                    active
                      ? "bg-burgundy text-white"
                      : "text-ink/75 hover:bg-sand hover:text-burgundy"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
