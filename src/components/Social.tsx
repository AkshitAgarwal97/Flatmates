"use client";

import { useState } from "react";

export function FavBtn({ id, on }: { id: string; on?: boolean }) {
  const [saved, setSaved] = useState(on);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      setSaved((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`btn-ghost text-xs flex items-center gap-1.5 ${saved ? "text-amber-400 border-amber-400/30" : ""}`}
      onClick={(e) => void toggle(e)}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
    >
      <span className={`text-base transition-transform ${loading ? "scale-90" : "scale-100"}`}>
        {saved ? "★" : "☆"}
      </span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function ReviewForm({ id }: { id: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="glass rounded-2xl p-4 text-sm">
        <p className="font-semibold text-teal-400">✓ Review submitted — thank you!</p>
        <p className="muted mt-1 text-xs">Your review helps others find trustworthy listings.</p>
      </div>
    );
  }

  return (
    <form
      className="glass space-y-3 rounded-2xl p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const fd = new FormData(e.currentTarget);
        await fetch(`/api/listings/${id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, text: fd.get("text") }),
        });
        setSubmitting(false);
        setDone(true);
      }}
    >
      <p className="text-sm font-semibold">Rate this stay / lister</p>

      {/* Star rating UI */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star-btn ${n <= (hover || rating) ? "text-amber-400" : "muted"}`}
            aria-pressed={n <= rating}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
        <span className="muted text-xs ml-2 tabular-nums">{rating}/5</span>
      </div>

      <input name="text" className="field" placeholder="Short review (optional)" maxLength={200} />
      <button className="btn text-xs" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
