"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

type Parts = { d: string; h: string; m: string; s: string };

/**
 * Live countdown to the wedding. Renders "—" on the server / first paint to
 * avoid hydration mismatch, then ticks every second. Stops gracefully at zero.
 * `targetIso` defaults to the seeded wedding_date; Phase 3 passes it from settings.
 */
export function Countdown({
  targetIso = "2026-10-24T14:00:00",
  className = "",
}: {
  targetIso?: string;
  className?: string;
}) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();

    const compute = (): boolean => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setParts({ d: "00", h: "00", m: "00", s: "00" });
        return false; // stop
      }
      setParts({
        d: pad(Math.floor(diff / 864e5)),
        h: pad(Math.floor((diff % 864e5) / 36e5)),
        m: pad(Math.floor((diff % 36e5) / 6e4)),
        s: pad(Math.floor((diff % 6e4) / 1e3)),
      });
      return true;
    };

    if (!compute()) return;
    const id = setInterval(() => {
      if (!compute()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const cell = (value: string | undefined, label: string) => (
    <div className="cd">
      <b>{value ?? "—"}</b>
      <span>{label}</span>
    </div>
  );

  return (
    <div
      className={`countdown ${className}`.trim()}
      aria-label="Countdown to the wedding"
    >
      {cell(parts?.d, "Days")}
      {cell(parts?.h, "Hours")}
      {cell(parts?.m, "Minutes")}
      {cell(parts?.s, "Seconds")}
    </div>
  );
}
