"use client";

import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Faq as FaqRow } from "@/lib/types";

function QItem({ faq }: { faq: FaqRow }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`q reveal${open ? " open" : ""}`}
      onClick={() => setOpen((o) => !o)}
    >
      <h4>{faq.question}</h4>
      {faq.answer && <div className="a">{faq.answer}</div>}
    </div>
  );
}

export function Faq({ faqs }: { faqs: FaqRow[] }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq">
      <div className="wrap">
        <SectionHead eyebrow="Good to know" title="Questions & Answers" />
        <div className="faq">
          {faqs.map((f) => (
            <QItem key={f.id} faq={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
