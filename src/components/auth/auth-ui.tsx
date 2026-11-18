"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { showErrorMood } from "@/lib/auth-mood";
import angryFace from "../../../public/images/itsuki-angry.jpg";

export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[2.75rem] leading-tight font-bold tracking-tight text-ink">{title}</h1>
      {children && <p className="mt-2 text-lg text-muted">{children}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <label htmlFor={htmlFor} className="block text-[17px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-[15px] text-muted">{hint}</p>}
    </div>
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className="field pr-14" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-3 my-auto flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-hover"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  required,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-[17px] text-ink-soft">
      <input
        id={id}
        type="checkbox"
        className="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  // Keyed on the message so each new mistake shakes again.
  return <ErrorCard key={message} message={message} />;
}

function ErrorCard({ message }: { message: string }) {
  useEffect(() => showErrorMood(), []);
  return (
    <div
      role="alert"
      className="shake flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 py-2.5 pr-4 pl-2.5 text-[15px] text-danger"
    >
      <Image
        src={angryFace}
        alt=""
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-full object-cover object-[50%_35%]"
      />
      <p>{message}</p>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4 text-[15px] text-muted">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function GoogleButton({ from, remember }: { from: "login" | "signup"; remember: boolean }) {
  return (
    <a href={`/api/auth/google?from=${from}&remember=${remember ? 1 : 0}`} className="btn-outline">
      <GoogleLogo />
      Continue with Google
    </a>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-6" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const OAUTH_ERRORS: Record<string, string> = {
  google_not_configured:
    "Google sign-in isn't set up on this server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "Google sign-in expired. Please try again.",
  google_failed: "Couldn't sign in with Google. Please try again.",
};

export function oauthErrorMessage(code: string | null) {
  return code ? (OAUTH_ERRORS[code] ?? "Something went wrong. Please try again.") : null;
}

/** POSTs JSON and returns the parsed body, throwing the server's error message on failure. */
export async function postJson<T = unknown>(url: string, body: unknown, method = "POST"): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
