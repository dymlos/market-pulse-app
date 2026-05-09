import type { ListingMetricSummary, MetricDelta } from "@/lib/causal-timeline";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";

type ListingMetricSummaryProps = {
  summary: ListingMetricSummary;
  currencyCode: string;
};

export function ListingMetricSummaryPanel({ summary, currencyCode }: ListingMetricSummaryProps) {
  const latest = summary.latestSnapshot;
  const hasComparison =
    summary.snapshotCount >= 2 && summary.firstSnapshot !== null && summary.latestSnapshot !== null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
        {hasComparison && summary.firstSnapshot && summary.latestSnapshot ? (
          <>
            Ventana comparada: primer snapshot visible del{" "}
            <span className="font-semibold text-ink">{formatDate(summary.firstSnapshot.snapshotDate)}</span>{" "}
            contra ultimo snapshot cargado del{" "}
            <span className="font-semibold text-ink">{formatDate(summary.latestSnapshot.snapshotDate)}</span>.
            La variacion es descriptiva y no prueba causalidad por si sola.
          </>
        ) : (
          <>
            Todavia no hay una ventana completa de comparacion. Carga al menos dos snapshots para leer
            una variacion antes/despues con mas contexto.
          </>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryBox label="Snapshots" value={summary.snapshotCount.toString()} />
        <SummaryBox label="Cambios" value={summary.changeCount.toString()} />
        <SummaryBox
          label="Ultimo dato"
          value={summary.latestDataAt ? formatDate(summary.latestDataAt) : "Sin dato"}
        />
        <SummaryBox
          label="Ultima lectura"
          value={latest ? `${formatNumber(latest.visits)} visitas / ${formatNumber(latest.salesUnits)} ventas` : "Sin dato"}
          detail={latest ? `Conversion ${formatPercent(latest.conversionRate)}` : undefined}
        />
      </div>

      {latest ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricBox label="Precio" value={formatCurrency(latest.price, currencyCode)} />
          <MetricBox label="Stock" value={formatNumber(latest.availableStock)} />
          <MetricBox label="Facturacion" value={formatCurrency(latest.revenue, currencyCode)} />
          <MetricBox label="Gasto ads" value={formatCurrency(latest.adSpend, currencyCode)} />
        </div>
      ) : null}

      {hasComparison ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left">
              <thead className="bg-panel-raised">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Metrica
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Primer snapshot
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Ultimo snapshot
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Variacion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel">
                {summary.variations.map((delta) => (
                  <tr key={delta.key}>
                    <td className="px-4 py-3 text-sm font-semibold text-ink">{delta.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                      {formatMetricValue(delta.firstValue, delta.unit, currencyCode)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                      {formatMetricValue(delta.lastValue, delta.unit, currencyCode)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                      {formatMetricDelta(delta, currencyCode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryBox({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-2 text-lg font-semibold text-ink">{value}</div>
      {detail ? <div className="mt-1 text-xs text-muted">{detail}</div> : null}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function formatMetricValue(
  value: number | null,
  unit: MetricDelta["unit"],
  currencyCode: string,
) {
  if (unit === "currency") {
    return formatCurrency(value, currencyCode);
  }

  if (unit === "percent") {
    return formatPercent(value);
  }

  return formatNumber(value);
}

function formatMetricDelta(delta: MetricDelta, currencyCode: string) {
  if (delta.absoluteDelta === null) {
    return "Sin dato";
  }

  const sign = delta.absoluteDelta > 0 ? "+" : "";
  const formatted =
    delta.unit === "currency"
      ? `${sign}${formatCurrency(delta.absoluteDelta, currencyCode)}`
      : delta.unit === "percent"
        ? `${sign}${formatNumber(delta.absoluteDelta)} pp`
        : `${sign}${formatNumber(delta.absoluteDelta)}`;

  if (delta.percentDelta === null || delta.unit === "percent") {
    return formatted;
  }

  const percentSign = delta.percentDelta > 0 ? "+" : "";
  return `${formatted} (${percentSign}${formatPercent(delta.percentDelta * 100)})`;
}
