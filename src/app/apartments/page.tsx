import type { Metadata } from "next";
import { IntentLandingView } from "@/components/IntentLanding";
import { getIntentLanding } from "@/lib/intent-landings";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const page = getIntentLanding("/apartments")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  keywords: page.keywords,
});

export default function ApartmentsPage() {
  return <IntentLandingView page={page} />;
}
