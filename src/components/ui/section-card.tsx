import type { PropsWithChildren } from "react";
import type { ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}>;

export function SectionCard({ title, description, eyebrow, action, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-line/80 bg-panel/75 p-6 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        {action ? (
          <div className="shrink-0">
            {action}
          </div>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
