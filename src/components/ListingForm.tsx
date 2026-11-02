"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceSearch } from "@/components/PlaceSearch";
import { imageToDataUrl } from "@/lib/client-crypto";
import type { Lifestyle, ListingMode } from "@/lib/types";

const lifestyleDefaults: Lifestyle = {
  genderPref: "anyone",
  diet: "veg",
  smoking: "no",
  drinking: "no",
  occupation: "it",
  schedule: "office",
  pets: "none",
  guests: "no_parties",
  washroom: "attached",
  roomType: "private",
  furnishing: "semi",
};

export function ListingForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ListingMode>("owner");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const dataUrl = await imageToDataUrl(file, 1100, 0.65);
      const body = new FormData();
      body.append("dataUrl", dataUrl);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.url !== "string") {
        throw new Error(data.error || "Image upload failed");
      }
      setImages((prev) => (prev.length >= 5 ? prev : [...prev, data.url]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const lifestyle: Lifestyle = {
      genderPref: fd.get("genderPref") as Lifestyle["genderPref"],
      diet: fd.get("diet") as Lifestyle["diet"],
      smoking: fd.get("smoking") as Lifestyle["smoking"],
      drinking: fd.get("drinking") as Lifestyle["drinking"],
      occupation: fd.get("occupation") as Lifestyle["occupation"],
      schedule: fd.get("schedule") as Lifestyle["schedule"],
      pets: fd.get("pets") as Lifestyle["pets"],
      guests: fd.get("guests") as Lifestyle["guests"],
      washroom: fd.get("washroom") as Lifestyle["washroom"],
      roomType: fd.get("roomType") as Lifestyle["roomType"],
      furnishing: fd.get("furnishing") as Lifestyle["furnishing"],
    };
    let locality = String(fd.get("locality") || "").trim();
    let city = String(fd.get("city") || "").trim();
    // Fallback: allow typed "Locality, City" if Maps suggestion wasn't clicked
    if (!city || !locality) {
      const typed = String(fd.get("placeText") || "").trim();
      if (typed.includes(",")) {
        const parts = typed.split(",").map((p) => p.trim()).filter(Boolean);
        locality = locality || parts[0] || "";
        city = city || parts[1] || parts[0] || "";
      } else if (typed) {
        city = city || typed;
        locality = locality || typed;
      }
    }
    if (!city) {
      setPending(false);
      setError("Enter a city/area or pick one from the suggestions");
      return;
    }
    if (!locality) locality = city;

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mode,
          title: fd.get("title"),
          description: fd.get("description"),
          city,
          locality,
          lat: Number(fd.get("lat")) || 0,
          lng: Number(fd.get("lng")) || 0,
          rent: Number(fd.get("rent")),
          deposit: Number(fd.get("deposit")),
          maintenanceIncluded: fd.get("maintenance") === "on",
          images,
          lifestyle,
          moveInDate: fd.get("moveInDate"),
          bhk: fd.get("bhk"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ||
            (res.status === 401
              ? "Please log in again, then post"
              : res.status === 413
                ? "Photos too large — remove some and try again"
                : "Could not post listing")
        );
        setPending(false);
        return;
      }
      router.push(`/listings/${data.listing.slug || data.listing.id}`);
    } catch {
      setError("Network error — try again");
      setPending(false);
    }
  }

  return (
    <form method="post" action="#" onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        {(
          [
            ["room_share", "Share a room", "Pre-occupied flat, replacing a flatmate"],
            ["seeker", "Looking for a roommate / room", "Your profile so people with a spare room can find you"],
            ["owner", "Entire property", "Owner listing, zero brokerage"],
          ] as const
        ).map(([id, title, sub]) => (
          <button
            type="button"
            key={id}
            onClick={() => setMode(id)}
            className={`glass rounded-2xl p-4 text-left ${mode === id ? "ring-2 ring-teal-300" : ""}`}
          >
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-xs text-white/55">{sub}</p>
          </button>
        ))}
      </div>
      <div className="glass space-y-3 rounded-2xl p-5">
        <input name="title" className="field" placeholder="Title" required />
        <textarea name="description" className="field min-h-28" placeholder="Describe the home, people, and house rules" />
        <div className="grid gap-3 md:grid-cols-2">
          <PlaceSearch />
          <input name="rent" type="number" className="field" placeholder="Monthly rent / budget ₹" required />
          <input name="deposit" type="number" className="field" placeholder="Deposit ₹" />
          <input name="bhk" className="field" placeholder="2BHK / 3BHK" />
          <input name="moveInDate" type="date" className="field" />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="maintenance" /> Maintenance included
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          disabled={uploading || images.length >= 5}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void upload(f);
          }}
        />
        {uploading && <p className="text-xs text-white/50">Compressing photo…</p>}
        <p className="text-xs text-white/45">Up to 5 photos. Optional — you can post without images.</p>
        <div className="flex flex-wrap gap-2">
          {images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src.slice(0, 48)} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      </div>
      <div className="glass grid gap-3 rounded-2xl p-5 md:grid-cols-2">
        {select("genderPref", "Gender preference", ["anyone", "female_only", "male_only", "couple", "lgbtq"], lifestyleDefaults.genderPref)}
        {select("diet", "Diet", ["veg", "eggetarian", "nonveg", "jain"], lifestyleDefaults.diet)}
        {select("smoking", "Smoking", ["no", "occasional", "yes"], lifestyleDefaults.smoking)}
        {select("drinking", "Drinking", ["no", "yes"], lifestyleDefaults.drinking)}
        {select("occupation", "Occupation", ["it", "student", "freelancer", "any"], lifestyleDefaults.occupation)}
        {select("schedule", "Schedule", ["wfh", "office", "night"], lifestyleDefaults.schedule)}
        {select("pets", "Pets", ["none", "friendly"], lifestyleDefaults.pets)}
        {select("guests", "Guests", ["no_parties", "overnight_ok"], lifestyleDefaults.guests)}
        {select("washroom", "Washroom", ["attached", "shared"], lifestyleDefaults.washroom)}
        {select("roomType", "Room", ["private", "twin"], lifestyleDefaults.roomType)}
        {select("furnishing", "Furnishing", ["full", "semi", "none"], lifestyleDefaults.furnishing)}
      </div>
      {error && <p className="text-rose-300">{error}</p>}
      <button type="submit" className="btn" disabled={pending || uploading}>
        {pending ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}

function select(name: string, label: string, options: string[], value: string) {
  return (
    <label className="text-xs text-white/55">
      {label}
      <select name={name} defaultValue={value} className="field mt-1">
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
