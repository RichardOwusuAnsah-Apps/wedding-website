"use client";

import { useEffect, useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";

type Attending = "yes" | "no";
type Which = "traditional" | "wedding" | "reception" | "all";
type Status = "idle" | "submitting" | "error";

// Options closed to a guest once their name is on the reception "closed list".
const RECEPTION_OPTIONS: Which[] = ["reception", "all"];

export function Rsvp({ deadlineNote }: { deadlineNote?: string }) {
  const [fullName, setFullName] = useState("");
  const [attending, setAttending] = useState<Attending>("yes");
  const [which, setWhich] = useState<Which | "">("all");
  // Set once the typed name matches the couple's private reception closed list.
  const [receptionClosed, setReceptionClosed] = useState(false);
  // Either the guest comes alone or they bring exactly one person, whose name
  // we take here so the couple has a real name for every seat.
  const [plusOne, setPlusOne] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [meal, setMeal] = useState("Standard");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Debounced lookup: does the reception closed list include this name?
  // Fails open — a lookup error never closes the reception on a real guest.
  useEffect(() => {
    const name = fullName.trim();
    if (!name) {
      setReceptionClosed(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/rsvp/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        setReceptionClosed(Boolean(data?.blocked));
      } catch {
        setReceptionClosed(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [fullName]);

  // If the reception closes on their name, drop any reception/"all" selection so
  // they re-pick among the open celebrations.
  useEffect(() => {
    if (receptionClosed && (which === "reception" || which === "all")) {
      setWhich("");
    }
  }, [receptionClosed, which]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your name.");
      setStatus("error");
      return;
    }
    if (plusOne && !guestName.trim()) {
      setError("Please add your guest's name.");
      setStatus("error");
      return;
    }
    if (attending === "yes" && which === "") {
      setError("Please choose which celebration you'll attend.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          attending: attending === "yes",
          events_attending: which,
          party_size: plusOne ? 2 : 1,
          guest_name: plusOne ? guestName.trim() : null,
          meal_preference: meal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "");
      }
      setDone(true);
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "Something went wrong. Please try again.");
    }
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
                    ["wedding", "Wedding"],
                    ["reception", "Reception"],
                    ["all", "All"],
                  ] as [Which, string][]
                ).map(([key, label]) => {
                  const closed =
                    receptionClosed && RECEPTION_OPTIONS.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${which === key ? "on" : ""}${closed ? " closed" : ""}`}
                      aria-disabled={closed}
                      onClick={() => {
                        if (closed) return; // message below explains why
                        setWhich(key);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {receptionClosed ? (
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "var(--color-burgundy)",
                    textAlign: "left",
                  }}
                >
                  The reception is fully booked — those seats are filled. You&rsquo;re
                  warmly invited to join us for the other celebrations.
                </p>
              ) : (
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--color-burgundy)",
                    textAlign: "left",
                  }}
                >
                  Whilst we love your little ones, the reception is an adults-only
                  celebration.
                </p>
              )}
            </div>

            <div className="field">
              <label>Number of guests</label>
              <div className="seg">
                <button
                  type="button"
                  className={plusOne ? "" : "on"}
                  onClick={() => {
                    setPlusOne(false);
                    setGuestName("");
                  }}
                >
                  Just me
                </button>
                <button
                  type="button"
                  className={plusOne ? "on" : ""}
                  onClick={() => setPlusOne(true)}
                >
                  +1
                </button>
              </div>
            </div>

            {plusOne && (
              <div className="field">
                <label htmlFor="rsvp-guest">Your guest&rsquo;s name</label>
                <input
                  id="rsvp-guest"
                  type="text"
                  placeholder="Their full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>
            )}

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
