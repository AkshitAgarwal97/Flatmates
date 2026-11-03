import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  lead,
  actions,
}: {
  kicker?: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="space-y-3">
      {kicker ? <p className="kicker text-xs uppercase tracking-[0.2em]">{kicker}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">{title}</h1>
        {actions}
      </div>
      {lead ? <p className="muted max-w-2xl">{lead}</p> : null}
    </header>
  );
}
