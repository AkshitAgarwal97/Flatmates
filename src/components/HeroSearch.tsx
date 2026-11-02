"use client";

import { CITIES } from "@/lib/hubs";
import { useMemo, useState, useRef, useEffect } from "react";

const CITY_ICONS: Record<string, string> = {
  Bangalore: "🌆",
  Mumbai: "🌊",
  Delhi: "🏛️",
  Pune: "🎓",
  Hyderabad: "💻",
  Chennai: "🌴",
  Kolkata: "🎭",
  Noida: "🏗️",
  Gurgaon: "🏢",
  Ahmedabad: "🏭",
  Jaipur: "🏰",
  Kochi: "⛵",
};

export function HeroSearch({
  defaultIntent = "rooms",
  defaultCity = "",
  defaultQ = "",
}: {
  defaultIntent?: "rooms" | "roommates";
  defaultCity?: string;
  defaultQ?: string;
}) {
  const [intent, setIntent] = useState<"rooms" | "roommates">(defaultIntent);
  const [cityQ, setCityQ] = useState(defaultCity);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const hits = useMemo(() => {
    const q = cityQ.trim().toLowerCase();
    if (!q) return CITIES.slice(0, 12);
    return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [cityQ]);

  const selected = CITIES.find((c) => c.toLowerCase() === cityQ.trim().toLowerCase()) || "";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <form action="/browse" className="mt-6 space-y-3">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="city" value={selected || cityQ.trim()} />

      {/* Intent toggle */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["rooms", "🏠 Rooms & flats"],
            ["roommates", "👥 Flatmates"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={intent === value ? "btn !py-1.5 text-xs" : "btn-ghost !py-1.5 text-xs"}
            onClick={() => setIntent(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search row */}
      <div className="grid gap-2 md:grid-cols-[1.1fr,1.4fr,auto]">
        {/* City autocomplete with quick grid */}
        <div className="relative">
          <input
            ref={inputRef}
            className="field"
            value={cityQ}
            onChange={(e) => {
              setCityQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Metro city — type to search"
            autoComplete="off"
            aria-label="Metro city"
            aria-expanded={open}
            aria-autocomplete="list"
          />

          {open && (
            <ul
              ref={dropdownRef}
              className="glass absolute z-20 mt-1 w-full overflow-auto rounded-xl p-2 text-sm shadow-xl"
              style={{ maxHeight: "280px" }}
              role="listbox"
            >
              {!cityQ.trim() && (
                <li className="px-2 pb-1 pt-0.5 text-[10px] uppercase tracking-widest muted-2">
                  Popular metro cities
                </li>
              )}
              <li>
                <div className="grid grid-cols-2 gap-1">
                  {hits.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="option"
                      aria-selected={cityQ.toLowerCase() === c.toLowerCase()}
                      className={`city-pill text-left ${cityQ.toLowerCase() === c.toLowerCase() ? "border-teal-400 bg-teal-400/10" : ""}`}
                      onClick={() => {
                        setCityQ(c);
                        setOpen(false);
                        inputRef.current?.blur();
                      }}
                    >
                      <span className="text-base">{CITY_ICONS[c] || "🏙️"}</span>
                      <span className="truncate">{c}</span>
                    </button>
                  ))}
                </div>
              </li>
            </ul>
          )}
        </div>

        <input
          name="q"
          defaultValue={defaultQ}
          className="field"
          placeholder="Locality, landmark, or keyword"
        />
        <button className="btn whitespace-nowrap">
          <svg
            className="mr-1.5"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
