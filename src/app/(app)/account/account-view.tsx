"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FormError, PasswordInput, postJson } from "@/components/auth/auth-ui";
import { useUser } from "@/components/app/user-context";
import { clearAllLocalData, getCollection, useCollection } from "@/lib/local-store";

export function AccountView() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="mx-auto w-full max-w-2xl space-y-10 py-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Account</h1>
          <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
            <Row label="Email" value={user.email} />
            <Row
              label="Sign-in"
              value={[user.hasPassword && "Email & password", user.google && "Google"].filter(Boolean).join(" · ")}
            />
            <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
          </dl>
        </div>
        <PasswordSection hasPassword={user.hasPassword} />
        <LocalDataSection />
        <DangerSection />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className="text-[16px] break-all text-ink">{value}</dd>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const { refresh } = useUser();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setDone(false);
    try {
      await postJson("/api/auth/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setDone(true);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Section
      title={hasPassword ? "Change password" : "Set a password"}
      description="Other devices will be signed out."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {hasPassword && (
          <PasswordInput
            placeholder="Current password"
            aria-label="Current password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        )}
        <PasswordInput
          placeholder="New password (at least 8 characters)"
          aria-label="New password"
          autoComplete="new-password"
          minLength={8}
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <FormError message={error} />
        {done && <p className="text-[15px] text-success">Password saved.</p>}
        <button type="submit" disabled={pending} className="btn-primary h-12! w-auto! px-6 text-base!">
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </Section>
  );
}

function LocalDataSection() {
  const chats = useCollection("chats");
  const notes = useCollection("notes");
  const memory = useCollection("memory");

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      chats: getCollection("chats"),
      notes: getCollection("notes"),
      memory: getCollection("memory"),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-club-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Section
      title="Data in this browser"
      description="Chats, notes and memory are stored only on this device. They don't sync to other browsers."
    >
      <p className="text-[16px] text-ink">
        {chats.length} chats · {notes.length} notes · {memory.length} memories
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={exportData} className="btn-outline h-11! w-auto! px-5 text-base!">
          Download a backup
        </button>
        <button
          type="button"
          onClick={() =>
            window.confirm("Delete all chats, notes and memory from this browser? This can't be undone.") &&
            clearAllLocalData()
          }
          className="btn-outline h-11! w-auto! px-5 text-base! text-danger!"
        >
          Clear local data
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">
        See{" "}
        <Link href="/privacy" className="underline">
          what&apos;s kept
        </Link>
        .
      </p>
    </Section>
  );
}

function DangerSection() {
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    if (!window.confirm("Delete your account permanently? Your chats and notes in this browser will be cleared too.")) {
      return;
    }
    try {
      await postJson("/api/auth/me", {}, "DELETE");
      clearAllLocalData();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
      window.location.assign("/signup");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Section title="Delete account" description="Removes your account from this site. This can't be undone.">
      <FormError message={error} />
      <button
        type="button"
        onClick={deleteAccount}
        className="mt-2 inline-flex h-11 items-center rounded-xl bg-danger px-5 text-base font-semibold text-white hover:opacity-90"
      >
        Delete account
      </button>
    </Section>
  );
}
