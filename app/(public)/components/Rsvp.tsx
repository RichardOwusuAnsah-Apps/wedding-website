"use client";

import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";

type Attending = "yes" | "no";
type Which = "traditional" | "white" | "both";

export function Rsvp({ deadlineNote }: { deadlineNote?: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<Attending>("yes");
  const [which, setWhich] = useState<Which>("both");
  const [partySize, setPartySize] = useState(1);
  const [meal, setMeal] = useState("Standard");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO(Phase 4): insert into `rsvps` + success state (+ optional Resend).
  }

  return (
    <section id="rsvp">
      <div className="wrap">
        <SectionHead eyebrow="Will you join us?" title="RSVP">
          {deadlineNote ||
            "Kindly respond so we can prepare to celebrate with you."}
        </SectionHead>

        <form className="rsvp-box reveal" onSubmit={handleSubmit}>
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

          <button className="btn-gold" type="submit">
            Send our RSVP
          </button>
        </form>
      </div>
    </section>
  );
}
