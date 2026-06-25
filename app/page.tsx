/**
 * Phase 0 placeholder hero — confirms the Tailwind design tokens and the four
 * typefaces resolve. The real Hero (monogram, live countdown, etc.) is built in
 * Phase 2 from the mockup.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center px-6 bg-[linear-gradient(180deg,#fbf7ef,var(--color-ivory))]">
      <span className="font-script text-[2.6rem] leading-none text-teal">
        Together with their families
      </span>

      <h1 className="mt-2 font-display font-semibold text-burgundy text-[clamp(3rem,11vw,7rem)]">
        Richie <span className="font-display italic font-normal text-gold">&amp;</span> Shula
      </h1>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 font-util uppercase tracking-[0.32em] text-sm text-ink">
        <span>24 · 10 · 2026</span>
        <i className="w-[5px] h-[5px] rotate-45 bg-gold" />
        <span>Maryland, USA</span>
      </div>

      <p className="eyebrow mt-10">Timeless · Elegant · Effortless</p>

      <p className="mt-8 max-w-md font-body text-muted">
        Phase 0 scaffold is live. Design tokens and fonts are wired up — the full
        site is built phase by phase from here.
      </p>
    </main>
  );
}
