"use client";

import { useState } from "react";
import { SKUS, type Sku } from "@/lib/pay";

export function PayButton({ sku, listingId }: { sku: Sku; listingId?: string }) {
  const [out, setOut] = useState("");
  async function pay() {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, listingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setOut(data.error || "Pay failed");
      return;
    }
    setOut(`Paid ₹${data.order.amount} · ${data.order.upi}`);
    setTimeout(() => location.reload(), 600);
  }
  return (
    <button className="btn-ghost text-xs" onClick={() => void pay()} title={out}>
      ₹{SKUS[sku].amount} · {SKUS[sku].label}
      {out ? ` · ${out}` : ""}
    </button>
  );
}
