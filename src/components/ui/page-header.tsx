type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
        {eyebrow}
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted">{description}</p>
      </div>
    </div>
  );
}
