"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Monogram } from "@/components/ui/Monogram";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm bg-white border border-line rounded-md p-10 text-center"
    >
      <Monogram className="mx-auto" />
      <h1 className="font-display text-3xl text-burgundy mb-1">Admin</h1>
      <p className="font-util text-[0.7rem] tracking-[0.18em] uppercase text-muted mb-7">
        Richie &amp; Shula
      </p>

      <div className="field text-left">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field text-left">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className="btn-gold" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      {error && <p className="form-note error">{error}</p>}
    </form>
  );
}
