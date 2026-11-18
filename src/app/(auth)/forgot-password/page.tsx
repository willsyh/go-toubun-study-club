"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { AuthHeading, Field, FormError, postJson } from "@/components/auth/auth-ui";

export default function ForgotPasswordPage() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await postJson("/api/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AuthHeading title="Reset password">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          Sign in
        </Link>
      </AuthHeading>

      {sent ? (
        <div className="space-y-4 text-lg text-ink-soft">
          <p>
            If an account exists for <strong className="text-ink">{email}</strong>, a reset link is on
            its way. The link works for 30 minutes.
          </p>
          <p className="text-[15px] text-muted">
            Running locally? Email isn&apos;t set up yet, so the link is printed in the server
            terminal.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <Field label="Email" htmlFor={`${uid}-email`}>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              required
              autoFocus
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <FormError message={error} />
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </>
  );
}
