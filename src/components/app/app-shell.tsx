"use client";

import { Menu, Moon, PanelLeft, SquarePen, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { setPref, setTheme, usePref, useTheme } from "@/lib/prefs";
import { SearchDialog } from "./search-dialog";
import { Sidebar } from "./sidebar";
import { UserProvider } from "./user-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const desktopOpen = usePref("gt:sidebar", "open") === "open";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function closeSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) setPref("gt:sidebar", "closed");
    else setMobileOpen(false);
  }

  return (
    <UserProvider>
      <div className="flex h-dvh overflow-hidden bg-canvas">
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
        <Sidebar
          desktopOpen={desktopOpen}
          mobileOpen={mobileOpen}
          onClose={closeSidebar}
          onNavigate={() => setMobileOpen(false)}
          onSearch={() => {
            setMobileOpen(false);
            setSearchOpen(true);
          }}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between px-3">
            <div className="flex items-center gap-1">
              <IconButton label="Open sidebar" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="size-5" />
              </IconButton>
              {!desktopOpen && (
                <>
                  <IconButton
                    label="Open sidebar"
                    className="hidden lg:inline-flex"
                    onClick={() => setPref("gt:sidebar", "open")}
                  >
                    <PanelLeft className="size-5" />
                  </IconButton>
                  <Link
                    href="/"
                    aria-label="New chat"
                    className="hidden size-10 items-center justify-center rounded-lg text-ink-soft hover:bg-hover lg:inline-flex"
                  >
                    <SquarePen className="size-5" />
                  </Link>
                </>
              )}
            </div>
            <PlanButton />
          </header>

          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <ThemeToggle />
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </UserProvider>
  );
}

export function IconButton({
  label,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-lg text-ink-soft transition hover:bg-hover ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function PlanButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-line px-4 py-1.5 text-[15px] font-medium text-ink transition hover:bg-hover"
        aria-expanded={open}
      >
        Plan
      </button>
      {open && (
        <div className="absolute top-11 right-0 z-20 w-64 rounded-xl border border-line bg-canvas p-4 text-sm shadow-lg">
          <p className="font-semibold text-ink">Free plan</p>
          <p className="mt-1 text-muted">Subscription plans are coming soon. Everything is free for now.</p>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="absolute right-5 bottom-5 z-10 hidden size-11 items-center justify-center rounded-full border border-line bg-canvas text-ink shadow-sm transition hover:bg-hover md:inline-flex"
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
