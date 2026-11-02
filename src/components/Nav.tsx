"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeProvider";

type NavUser = { name?: string; email?: string };

const LINKS = [
  { href: "/browse", label: "Browse", match: (path: string, intent: string | null) => path === "/browse" && intent !== "roommates" },
  { href: "/browse?intent=roommates", label: "Roommates", match: (path: string, intent: string | null) => path === "/browse" && intent === "roommates" },
  { href: "/flatmates", label: "Cities", match: (path: string) => path.startsWith("/flatmates") },
  { href: "/flat", label: "Flats", match: (path: string) => path === "/flat" || path === "/apartments" || path === "/houses" || path === "/rooms" || path === "/rent" },
  { href: "/guides", label: "Guides", match: (path: string) => path.startsWith("/guides") },
  { href: "/map", label: "Map", match: (path: string) => path === "/map" },
  { href: "/listings/new", label: "Post", match: (path: string) => path.startsWith("/listings/new") },
  { href: "/pricing", label: "Boost", match: (path: string) => path === "/pricing" },
  { href: "/chat", label: "Chat", match: (path: string) => path.startsWith("/chat") },
  { href: "/contact", label: "Support", match: (path: string) => path === "/contact" },
];

function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname() || "/";
  const search = useSearchParams();
  const intent = search.get("intent");

  return (
    <nav className={className} aria-label="Main navigation">
      {LINKS.map((link) => {
        const active = link.match(pathname, intent);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "nav-link nav-link-active pb-0.5" : "nav-link pb-0.5"}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Nav() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  return (
    <header className="glass sticky top-0 z-40 mx-auto mt-4 w-[min(1120px,calc(100%-1.5rem))] rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          flatmates<span className="text-teal-600 dark:text-teal-300">.co.in</span>
        </Link>

        <Suspense fallback={<nav className="hidden sm:block h-5 w-80 skeleton" />}>
          <NavLinks className="hidden items-center gap-4 text-sm sm:flex" />
        </Suspense>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!authReady ? (
            <span className="skeleton h-8 w-16" aria-hidden />
          ) : user ? (
            <Link href="/dashboard" className="btn-ghost !py-1.5 !px-3 text-xs">
              {(user.name || user.email || "Account").split(" ")[0].split("@")[0]}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost !py-1.5 !px-3 text-xs">Login</Link>
              <Link href="/register" className="btn !py-1.5 !px-3 text-xs">Join free</Link>
            </>
          )}
          <button
            type="button"
            className="btn-ghost !px-2.5 !py-1.5 sm:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open ? (
        <Suspense fallback={<div className="mt-3 h-24 skeleton sm:hidden" />}>
          <NavLinks
            className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-sm sm:hidden"
            onNavigate={() => setOpen(false)}
          />
        </Suspense>
      ) : null}
    </header>
  );
}
