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
    <section className="rounded-3xl border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
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
