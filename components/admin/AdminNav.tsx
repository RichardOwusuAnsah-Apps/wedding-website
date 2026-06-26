"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, isNavActive } from "@/lib/admin/nav";

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {ADMIN_NAV_ITEMS.map(([href, label]) => {
        const active = isNavActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`font-util text-[0.72rem] tracking-[0.12em] uppercase px-3 py-2 rounded-[2px] transition ${
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
  );
}
