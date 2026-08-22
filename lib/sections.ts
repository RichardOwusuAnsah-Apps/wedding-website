// Sections that can be shown/hidden on the public site from the admin panel.
// Visibility is stored in the key-value `settings` table: value "0" = hidden,
// anything else (including unset) = visible. Plain module — client + server safe.

export const SECTION_TOGGLES = {
  hotels: { key: "show_hotels", label: "Travel & Stay" },
  vendors: { key: "show_vendors", label: "Our Vendors" },
  registry: { key: "show_registry", label: "Registry & Gifts" },
  faq: { key: "show_faq", label: "FAQ" },
} as const;

export type SectionSlug = keyof typeof SECTION_TOGGLES;

/** A section is visible unless its setting is explicitly "0". */
export function isSectionVisible(
  settings: Record<string, string>,
  slug: SectionSlug,
): boolean {
  return settings[SECTION_TOGGLES[slug].key] !== "0";
}
