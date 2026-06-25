"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [href: string, label: string][] = [
  ["/admin", "Dashboard"],
  ["/admin/settings", "Settings"],
  ["/admin/story", "Our Story"],
  ["/admin/events", "Celebrations"],
  ["/admin/party", "Wedding Party"],
  ["/admin/gallery", "Gallery"],
  ["/admin/venues", "Venues"],
  ["/admin/hotels", "Travel & Stay"],
  ["/admin/family", "Family"],
  ["/admin/vendors", "Vendors"],
  ["/admin/registry", "Registry"],
  ["/admin/faq", "FAQ"],
  ["/admin/rsvps", "RSVPs"],
  ["/admin/guestbook", "Guestbook"],
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {ITEMS.map(([href, label]) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
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
