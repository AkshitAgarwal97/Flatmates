export const SKUS = {
  boost: { amount: 49, label: "Listing Top Boost (7 days)" },
  urgent: { amount: 29, label: "Urgent Requirement tag" },
  pro: { amount: 99, label: "Verified Pro Badge" },
} as const;

export type Sku = keyof typeof SKUS;

export function live(until?: string) {
  return !!until && new Date(until).getTime() > Date.now();
}
