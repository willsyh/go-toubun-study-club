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

export function LoginForm() {
  const params = useSearchParams();
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(oauthErrorMessage(params.get("error")));
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await postJson("/api/auth/login", { email, password, remember });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
      window.location.assign("/");
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <>
      <AuthHeading title="Welcome back">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-ink hover:underline">
          Sign up
        </Link>
      </AuthHeading>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <Field label="Email" htmlFor={`${uid}-email`}>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            required
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor={`${uid}-password`}>
          <PasswordInput
            id={`${uid}-password`}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
          <Link href="/forgot-password" className="text-[17px] font-medium text-ink hover:underline">
            Forgot password?
          </Link>
        </div>

        <FormError message={error} />

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <OrDivider />
        <GoogleButton from="login" remember={remember} />
      </form>
    </>
  );
}
