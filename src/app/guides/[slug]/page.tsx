import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { GUIDES, getGuide, allGuideSlugs } from "@/lib/guides";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return allGuideSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: "Guide not found" };
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: guide.keywords,
  });
}

export default function GuidePage({ params }: Props) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  return (
    <article className="space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          articleJsonLd({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}` }),
          howToJsonLd({ name: guide.title, description: guide.answer, steps: guide.sections }),
          faqJsonLd(guide.faqs),
        ]}
      />
      <nav className="text-xs text-white/45">
        <Link href="/" className="hover:text-teal-200">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/guides" className="hover:text-teal-200">
          Guides
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{guide.title}</span>
      </nav>

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{guide.title}</h1>
        <div className="glass rounded-2xl border border-teal-400/20 p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-teal-200">Quick answer</p>
          <p className="mt-2 text-white/80">{guide.answer}</p>
        </div>
      </header>

      <div className="space-y-3">
        {guide.sections.map((s) => (
          <details key={s.heading} className="glass rounded-2xl p-4">
            <summary className="cursor-pointer font-medium">{s.heading}</summary>
            <p className="muted mt-2 text-sm">{s.body}</p>
          </details>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/browse" className="btn">
          Browse listings
        </Link>
        <Link href="/listings/new" className="btn-ghost">
          Post free
        </Link>
        {guide.relatedPaths.map((r) => (
          <Link key={r.href} href={r.href} className="btn-ghost text-xs">
            {r.label}
          </Link>
        ))}
      </div>

      <FaqBlock faqs={guide.faqs} />

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">More guides</h2>
          <ul className="space-y-2 text-sm">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-teal-200 hover:underline">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
