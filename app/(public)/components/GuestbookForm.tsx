"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "error";

export function GuestbookForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a message.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");

    const supabase = createClient();
    // status must be 'pending' — RLS only allows public inserts of pending rows.
    const { error: insertError } = await supabase.from("guestbook").insert({
      name: name.trim(),
      message: message.trim(),
      status: "pending",
    });

    if (insertError) {
      console.error("[guestbook]", insertError.message);
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="form-note success" style={{ marginTop: 30 }}>
        Thank you for your kind words — your message will appear once approved.
      </p>
    );
  }

  if (!open) {
    return (
      <div className="center" style={{ marginTop: 30 }}>
        <button
          className="nav-rsvp"
          type="button"
          onClick={() => setOpen(true)}
        >
          Sign the guestbook
        </button>
      </div>
    );
  }

  return (
    <form
      className="rsvp-box reveal in"
      onSubmit={handleSubmit}
      noValidate
      style={{ marginTop: 30 }}
    >
      <div className="field">
        <label htmlFor="gb-name">Your name</label>
        <input
          id="gb-name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="gb-message">Your message</label>
        <textarea
          id="gb-message"
          rows={4}
          placeholder="Share a blessing or well-wish…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button
        className="btn-gold"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Leave your wish"}
      </button>
      {status === "error" && <p className="form-note error">{error}</p>}
    </form>
  );
}
