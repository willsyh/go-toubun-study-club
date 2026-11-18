"use client";

import { Bookmark, LogOut, Moon, NotebookText, PanelLeft, Search, SquarePen, Sun, Trash, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { update, useCollection } from "@/lib/local-store";
import { setTheme, useTheme } from "@/lib/prefs";
import { getTutor } from "@/lib/tutors";
import { TutorAvatar } from "./tutor-avatar";
import { useUser } from "./user-context";

type Props = {
  desktopOpen: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onSearch: () => void;
};

export function Sidebar({ desktopOpen, mobileOpen, onClose, onNavigate, onSearch }: Props) {
  const pathname = usePathname();
  const { logout } = useUser();
  const theme = useTheme();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${desktopOpen ? "lg:flex" : "lg:hidden"}`}
    >
      <div className="flex h-14 shrink-0 items-center px-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          title="Close sidebar"
          className="inline-flex size-10 items-center justify-center rounded-lg text-ink-soft hover:bg-hover"
        >
          <PanelLeft className="size-5" />
        </button>
      </div>

      <nav className="space-y-0.5 px-3">
        <NavItem href="/" icon={<SquarePen className="size-5" />} label="New chat" onClick={onNavigate} />
        <button type="button" onClick={onSearch} className={navClass(false)}>
          <Search className="size-5" />
          <span className="flex-1 text-left">Search chats</span>
          <kbd className="hidden text-xs text-muted lg:inline">Ctrl K</kbd>
        </button>
        <NavItem
          href="/notes"
          icon={<NotebookText className="size-5" />}
          label="Notes"
          active={pathname === "/notes"}
          onClick={onNavigate}
        />
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
        <Suspense>
          <RecentChats onNavigate={onNavigate} />
        </Suspense>
      </div>

      <nav className="space-y-0.5 px-3 pt-2 pb-4">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`${navClass(false)} md:hidden`}
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <NavItem
          href="/memory"
          icon={<Bookmark className="size-5" />}
          label="Memory"
          active={pathname === "/memory"}
          onClick={onNavigate}
        />
        <NavItem
          href="/account"
          icon={<User className="size-5" />}
          label="Account"
          active={pathname === "/account"}
          onClick={onNavigate}
        />
        <button type="button" onClick={() => void logout()} className={navClass(false)}>
          <LogOut className="size-5" />
          Log out
        </button>
      </nav>
    </aside>
  );
}

function navClass(active: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[17px] text-ink transition hover:bg-hover ${
    active ? "bg-hover font-medium" : ""
  }`;
}

function NavItem({
  href,
  icon,
  label,
  active = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={navClass(active)} aria-current={active ? "page" : undefined}>
      {icon}
      {label}
    </Link>
  );
}

function RecentChats({ onNavigate }: { onNavigate: () => void }) {
  const chats = useCollection("chats");
  const router = useRouter();
  const pathname = usePathname();
  const activeId = useSearchParams().get("c");
  if (!chats.length) return null;

  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  function remove(id: string) {
    if (!window.confirm("Delete this chat? This can't be undone.")) return;
    update("chats", (list) => list.filter((c) => c.id !== id));
    if (pathname === "/" && activeId === id) router.replace("/");
  }

  return (
    <div>
      <p className="px-2.5 pb-2 text-sm font-medium text-muted">Recent</p>
      <ul className="space-y-0.5">
        {sorted.map((chat) => {
          const active = pathname === "/" && chat.id === activeId;
          return (
            <li key={chat.id} className="group relative">
              <Link
                href={`/?c=${chat.id}`}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-lg py-2 pr-9 pl-2.5 text-[15px] text-ink transition hover:bg-hover ${
                  active ? "bg-hover font-medium" : ""
                }`}
              >
                <TutorAvatar tutor={getTutor(chat.tutorId)} size={22} />
                <span className="truncate">{chat.title}</span>
              </Link>
              <button
                type="button"
                onClick={() => remove(chat.id)}
                aria-label={`Delete chat ${chat.title}`}
                className="absolute inset-y-0 right-1 my-auto hidden size-7 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-danger group-hover:inline-flex focus:inline-flex"
              >
                <Trash className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
