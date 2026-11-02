"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInAppHref(href: string | null) {
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return href.startsWith("/");
}

function ProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!isInAppHref(href)) return;
      const next = href!.startsWith("http") ? new URL(href!).pathname + new URL(href!).search : href!;
      const here = `${window.location.pathname}${window.location.search}`;
      if (next === here) return;
      setActive(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setActive(false), 400);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  if (!active) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none" aria-hidden>
      <div className="h-0.5 w-full overflow-hidden">
        <div className="nav-progress-bar h-full bg-gradient-to-r from-teal-400 via-sky-400 to-teal-300" />
      </div>
      <div className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 shadow">
        <svg className="animate-spin text-teal-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    </div>
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressInner />
    </Suspense>
  );
}
