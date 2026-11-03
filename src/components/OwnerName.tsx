import { SITE_OWNER_LINKEDIN, SITE_OWNER_NAME } from "@/lib/seo";

export function OwnerName({ className = "font-semibold text-fg kicker hover:underline" }: { className?: string }) {
  return (
    <a href={SITE_OWNER_LINKEDIN} target="_blank" rel="noopener noreferrer" className={className}>
      {SITE_OWNER_NAME}
    </a>
  );
}
