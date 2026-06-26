// Shared admin navigation items (used by the desktop sidebar + mobile menu).
export const ADMIN_NAV_ITEMS: [href: string, label: string][] = [
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

export function isNavActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
