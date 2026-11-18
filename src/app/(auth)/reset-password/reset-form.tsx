"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { AuthHeading, Field, FormError, PasswordInput, postJson } from "@/components/auth/auth-ui";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const uid = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    token ? null : "This reset link is missing its token. Request a new one.",
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await postJson("/api/auth/reset", { token, password });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
      window.location.assign("/");
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <>
      <AuthHeading title="Choose a new password">
        Link expired?{" "}
        <Link href="/forgot-password" className="font-medium text-ink hover:underline">
          Request another
        </Link>
      </AuthHeading>
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <Field label="New password" htmlFor={`${uid}-password`} hint="At least 8 characters.">
          <PasswordInput
            id={`${uid}-password`}
            autoComplete="new-password"
            required
            minLength={8}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <FormError message={error} />
        <button type="submit" className="btn-primary" disabled={pending || !token}>
          {pending ? "Saving…" : "Save and sign in"}
        </button>
      </form>
    </>
  );
}
