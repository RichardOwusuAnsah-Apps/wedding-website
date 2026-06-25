import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { getSettings } from "@/lib/queries";

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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <ScrollReveal />
    </>
  );
}
