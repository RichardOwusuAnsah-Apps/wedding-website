"use client";

import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { createClient } from "@/lib/supabase/client";

type Attending = "yes" | "no";
type Which = "traditional" | "white" | "both";
type Status = "idle" | "submitting" | "error";

export function Rsvp({ deadlineNote }: { deadlineNote?: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<Attending>("yes");
  const [which, setWhich] = useState<Which>("both");
  const [partySize, setPartySize] = useState(1);
  const [meal, setMeal] = useState("Standard");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your name.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("rsvps").insert({
      full_name: fullName.trim(),
      email: email.trim() || null,
      attending: attending === "yes",
      events_attending: which,
      party_size: partySize,
      meal_preference: meal,
    });

    if (insertError) {
      console.error("[rsvp]", insertError.message);
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <section id="rsvp">
      <div className="wrap">
        <SectionHead eyebrow="Will you join us?" title="RSVP">
          {deadlineNote ||
            "Kindly respond so we can prepare to celebrate with you."}
        </SectionHead>

        {done ? (
          <div className="rsvp-box reveal" style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--color-burgundy)", fontSize: "1.9rem" }}>
              Thank you{fullName.trim() ? `, ${fullName.trim().split(" ")[0]}` : ""}!
            </h3>
            <p style={{ color: "var(--color-muted)", marginTop: 10 }}>
              {attending === "yes"
                ? "Your RSVP is in — we can't wait to celebrate with you."
                : "Thank you for letting us know — you'll be missed."}
            </p>
          </div>
        ) : (
          <form className="rsvp-box reveal" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="rsvp-name">Full name</label>
              <input
                id="rsvp-name"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="rsvp-email">Email</label>
              <input
                id="rsvp-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Will you attend?</label>
              <div className="seg">
                <button
                  type="button"
                  className={attending === "yes" ? "on" : ""}
                  onClick={() => setAttending("yes")}
                >
                  Joyfully accept
                </button>
                <button
                  type="button"
                  className={attending === "no" ? "on" : ""}
                  onClick={() => setAttending("no")}
                >
                  Regretfully decline
                </button>
              </div>
            </div>

            <div className="field">
              <label>Which celebrations?</label>
              <div className="seg">
                {(
                  [
                    ["traditional", "Traditional"],
                    ["white", "White Wedding"],
                    ["both", "Both"],
                  ] as [Which, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={which === key ? "on" : ""}
                    onClick={() => setWhich(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="rsvp-party">Number of guests</label>
              <select
                id="rsvp-party"
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
              >
                <option value={1}>Just me</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="rsvp-meal">Meal preference</label>
              <select
                id="rsvp-meal"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              >
                <option>Standard</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Allergy — please specify</option>
              </select>
            </div>

            <button
              className="btn-gold"
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending…" : "Send our RSVP"}
            </button>

            {status === "error" && <p className="form-note error">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
