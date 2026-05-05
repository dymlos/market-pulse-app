type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-panel p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}
