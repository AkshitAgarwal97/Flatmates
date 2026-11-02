import type { FaqItem } from "@/lib/seo";

export function FaqBlock({ faqs, title = "Frequently asked questions" }: { faqs: FaqItem[]; title?: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={f.q} className="glass rounded-2xl p-4" open={i === 0}>
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="muted mt-2 text-sm">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
