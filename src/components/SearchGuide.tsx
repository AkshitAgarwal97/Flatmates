import { FaqBlock } from "./FaqBlock";

const SEARCH_FAQS = [
  {
    q: "How do I search for a room or flatmate?",
    a: "Pick Rooms & flats or Flatmates, type a metro city, add a locality if you know one, then Search. Filters for rent, diet, washroom, and pets sit on the results page.",
  },
  {
    q: "What do the tags on a listing card mean?",
    a: "Each tag is labeled in words: Veg / Non-veg / Jain, Attached or Shared bath, Pet friendly or No pets, and furnishing. Share a room means a current tenant; Entire flat is an owner listing; Seeking is someone looking for a place.",
  },
  {
    q: "How do I contact someone safely?",
    a: "Phone numbers stay hidden. Login and use in-app chat. Report broker spam or fake listings from the listing page. Never pay a large deposit before a video walkthrough.",
  },
];

export function SearchGuide() {
  return <FaqBlock faqs={SEARCH_FAQS} title="How search works" />;
}
