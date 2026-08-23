import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { HashLanding } from "@/components/site/HashLanding";
import { getSettings } from "@/lib/queries";
import { isSectionVisible } from "@/lib/sections";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const names = s.couple_names || "Richie & Shula";
  const tagline = s.tagline || "Timeless · Elegant · Effortless";
  const title = `${names} — Our Wedding`;
  const description = `Join us as ${names} celebrate their wedding on 24 October 2026 in Maryland, USA. ${tagline}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  const monogramSrc = s.monogram_path
    ? publicImageUrl("gallery", s.monogram_path)
    : undefined;

  // Drop nav links that point at sections hidden from the public site.
  const hiddenHrefs = [
    !isSectionVisible(s, "hotels") && "#travel",
    !isSectionVisible(s, "registry") && "#registry",
    !isSectionVisible(s, "faq") && "#faq",
  ].filter(Boolean) as string[];

  return (
    <>
      <SiteNav monogramSrc={monogramSrc} hiddenHrefs={hiddenHrefs} />
      <main>{children}</main>
      <SiteFooter />
      <ScrollReveal />
      <HashLanding />
    </>
  );
}
