import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { CITIES } from "@/lib/hubs";
import { HINDI_LANDING } from "@/lib/intent-landings";
import { breadcrumbJsonLd, cityPath, faqJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const faqs = [
  {
    q: "Flatmates.co.in पर क्या मिलता है?",
    a: "भारत के मेट्रो शहरों में किराये का कमरा, पूरा फ्लैट/अपार्टमेंट, घर, और रूममेट/फ्लैटमेट — बिना ब्रोकर के। चैट इन-ऐप है, फोन नंबर सार्वजनिक नहीं होते।",
  },
  {
    q: "ब्रोकरेज कितनी है?",
    a: "हमेशा ₹0. किराया और डिपॉजिट मालिक या फ्लैटमेट्स को तय समझौते के अनुसार देना होता है।",
  },
  {
    q: "कौन से शहर?",
    a: `${CITIES.slice(0, 15).join(", ")} और अन्य मेट्रो शहर।`,
  },
];

export const metadata: Metadata = pageMetadata({
  title: HINDI_LANDING.title,
  description: HINDI_LANDING.description,
  path: HINDI_LANDING.path,
  keywords: HINDI_LANDING.keywords,
});

export default function HindiLandingPage() {
  return (
    <div className="space-y-10" lang="hi">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "हिन्दी", path: "/hi" },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <section className="glass rounded-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">किराया · मकान · फ्लैट · रूममेट · ब्रोकरेज ₹0</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          किराये का मकान, फ्लैट या रूममेट — बिना ब्रोकर
        </h1>
        <p className="mt-4 max-w-2xl text-white/65">
          अगर आप घर, अपार्टमेंट, कमरा या रूममेट ढूंढ रहे हैं तो Flatmates.co.in मुफ्त है। डाइट, जेंडर प्रिफरेंस और
          लाइफस्टाइल से मैच करें, फिर इन-ऐप चैट करें।
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/browse?intent=rooms" className="btn">
            कमरा / फ्लैट देखें
          </Link>
          <Link href="/browse?intent=roommates" className="btn-ghost">
            रूममेट खोजें
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            मुफ्त पोस्ट करें
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">मेट्रो शहर</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <Link key={city} href={cityPath(city)} className="btn-ghost text-xs">
              {city} में किराया
            </Link>
          ))}
        </div>
      </section>

      <FaqBlock faqs={faqs} title="अक्सर पूछे जाने वाले सवाल" />
    </div>
  );
}
