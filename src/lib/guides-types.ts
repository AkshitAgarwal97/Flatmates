import type { FaqItem } from "@/lib/seo";

export type GuideSection = { heading: string; body: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  answer: string;
  sections: GuideSection[];
  faqs: FaqItem[];
  relatedPaths: { href: string; label: string }[];
};
