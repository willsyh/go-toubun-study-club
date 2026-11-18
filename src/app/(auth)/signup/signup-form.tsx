"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  AuthHeading,
  Checkbox,
  Field,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordInput,
  oauthErrorMessage,
  postJson,
} from "@/components/auth/auth-ui";

export function SignupForm() {
  const params = useSearchParams();
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(oauthErrorMessage(params.get("error")));
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await postJson("/api/auth/signup", { email, password, ageConfirmed, remember });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
      window.location.assign("/");
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <>
      <AuthHeading title="Create an account">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          Sign in
        </Link>
      </AuthHeading>

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
        <Field label="Password" htmlFor={`${uid}-password`} hint="At least 8 characters.">
          <PasswordInput
            id={`${uid}-password`}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="space-y-4">
          <Checkbox label="I'm 13 or older" checked={ageConfirmed} onChange={setAgeConfirmed} />
          <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
        </div>

        <p className="text-[15px] leading-relaxed text-muted">
          This site keeps your email with your account. Your chats and notes stay in this browser.
          See{" "}
          <Link href="/privacy" className="font-medium text-ink hover:underline">
            what&apos;s kept
          </Link>
          .
        </p>

        <FormError message={error} />

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creating account…" : "Sign up"}
        </button>
        <OrDivider />
        <GoogleButton from="signup" remember={remember} />
      </form>
    </>
  );
}
