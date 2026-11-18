import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "What's kept" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-[17px] leading-relaxed text-ink-soft">
      <Link href="/signup" className="text-sm text-muted hover:underline">
        ← Back
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">What&apos;s kept</h1>

      <h2 className="mt-10 text-xl font-semibold text-ink">On our server</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Your email address.</li>
        <li>Your password, stored only as a salted scrypt hash — never in plain text.</li>
        <li>If you use Google sign-in, your Google account ID so we can recognise you next time.</li>
        <li>When you created your account.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-ink">Only in your browser</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Your chats with the tutors.</li>
        <li>Your notes.</li>
        <li>Your memory items.</li>
        <li>Preferences like dark mode and your chosen tutor.</li>
      </ul>
      <p className="mt-3">
        These never leave this device. Clearing your browser data, or using another browser, means they
        won&apos;t be there. You can download a backup from the Account page.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Cookies</h2>
      <p className="mt-3">
        One sign-in cookie keeps you logged in. With &ldquo;Remember me&rdquo; it lasts 30 days; without it, it ends
        when you close the browser.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Deleting</h2>
      <p className="mt-3">
        Delete your account from the Account page at any time. That removes everything we keep on the server
        and clears this browser&apos;s chats and notes.
      </p>
    </main>
  );
}
