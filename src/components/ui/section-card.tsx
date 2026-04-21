import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  eyebrow?: string;
}>;

export function SectionCard({ title, description, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-panel">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
