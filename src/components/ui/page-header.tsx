type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="rounded-2xl border border-line/80 bg-panel/75 px-6 py-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="max-w-4xl text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
