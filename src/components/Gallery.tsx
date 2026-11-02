"use client";

import { useEffect, useState, type MouseEvent } from "react";

export function Gallery({ images, alt = "Flat listing photo" }: { images: string[]; alt?: string }) {
  const [i, setI] = useState<number | null>(null);
  const pics = images.length ? images : ["/room.svg"];

  useEffect(() => {
    if (i === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setI(null);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setI((cur) => (cur === null ? 0 : (cur + 1) % pics.length));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setI((cur) => (cur === null ? 0 : (cur - 1 + pics.length) % pics.length));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, pics.length]);

  function step(delta: number, e?: MouseEvent) {
    e?.stopPropagation();
    setI((cur) => {
      const n = cur ?? 0;
      return (n + delta + pics.length) % pics.length;
    });
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {pics.map((src, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + n}
            src={src}
            alt={`${alt} ${n + 1}`}
            className="h-56 w-full cursor-zoom-in rounded-2xl object-cover"
            onClick={() => setI(n)}
          />
        ))}
      </div>
      {i !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setI(null)}
        >
          {pics.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-2xl text-white hover:bg-white/30"
                onClick={(e) => step(-1, e)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-2xl text-white hover:bg-white/30"
                onClick={(e) => step(1, e)}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pics[i]}
            alt={`${alt} ${(i ?? 0) + 1}`}
            className="max-h-[90vh] max-w-full rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 text-sm text-white">
            {i + 1} / {pics.length}
          </p>
        </div>
      )}
    </>
  );
}
