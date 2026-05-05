import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { SearchSnapshotComparison } from "@/lib/search-snapshot-comparison";

type SearchSnapshotComparisonPanelProps = {
  comparison: SearchSnapshotComparison;
  beforeLabel: string;
  afterLabel: string;
  currencyCode: string;
};

export function SearchSnapshotComparisonPanel({
  comparison,
  beforeLabel,
  afterLabel,
  currencyCode,
}: SearchSnapshotComparisonPanelProps) {
  const rows = [
    {
      label: "Resultados cargados",
      before: comparison.before.totalResults,
      after: comparison.after.totalResults,
    },
    {
      label: "Apariciones propias",
      before: comparison.before.ownCount,
      after: comparison.after.ownCount,
    },
    {
      label: "Apariciones de competidores",
      before: comparison.before.competitorCount,
      after: comparison.after.competitorCount,
    },
    {
      label: "Propias en top 5",
      before: comparison.before.ownTop5Count,
      after: comparison.after.ownTop5Count,
    },
    {
      label: "Propias en top 10",
      before: comparison.before.ownTop10Count,
      after: comparison.after.ownTop10Count,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-left">
            <thead className="bg-panel-raised">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Senal
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  {beforeLabel}
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  {afterLabel}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 text-sm font-semibold text-ink">{row.label}</td>
                  <td className="px-4 py-3 text-sm text-ink">{formatNumber(row.before)}</td>
                  <td className="px-4 py-3 text-sm text-ink">{formatNumber(row.after)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChangeList
          emptyLabel="Sin competidores nuevos en el snapshot comparado."
          items={comparison.newCompetitors}
          title="Competidores nuevos"
        />
        <ChangeList
          emptyLabel="Sin competidores desaparecidos frente al snapshot base."
          items={comparison.disappearedCompetitors}
          title="Competidores que desaparecieron"
        />
      </div>

      <div className="rounded-2xl border border-line bg-panel-raised p-4">
        <h3 className="text-sm font-semibold text-ink">Share of shelf simple en snapshot comparado</h3>
        {comparison.after.competitorAppearances.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Competidor / seller
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Apariciones
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Top 5
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Top 10
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Posiciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel-raised">
                  {comparison.after.competitorAppearances.map((appearance) => (
                    <tr key={appearance.key}>
                      <td className="px-4 py-3 text-sm font-semibold text-ink">
                        {appearance.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{appearance.count}</td>
                      <td className="px-4 py-3 text-sm text-ink">{appearance.top5Count}</td>
                      <td className="px-4 py-3 text-sm text-ink">{appearance.top10Count}</td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {appearance.positions.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            No hay competidores vinculados ni sellers visibles suficientes para calcular presencia ajena.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-panel-raised p-4">
        <h3 className="text-sm font-semibold text-ink">Cambios simples de precio observados</h3>
        {comparison.priceChanges.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Precio base
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Precio comparado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Variacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Posicion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel-raised">
                  {comparison.priceChanges.map((change) => (
                    <tr key={change.key}>
                      <td className="px-4 py-3 text-sm font-semibold text-ink">{change.label}</td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {formatCurrency(change.beforePrice, currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {formatCurrency(change.afterPrice, currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge tone={change.absoluteDelta > 0 ? "warning" : "success"}>
                          {formatSignedCurrency(change.absoluteDelta, currencyCode)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {change.beforePosition} a {change.afterPosition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            Sin cambios de precio comparables con los datos cargados.
          </p>
        )}
      </div>
    </div>
  );
}

function ChangeList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: SearchSnapshotComparison["newCompetitors"];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel-raised p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{item.label}</span>
              <span className="text-muted">{item.positions.join(", ")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}

function formatSignedCurrency(value: number, currencyCode: string) {
  const formatted = formatCurrency(Math.abs(value), currencyCode);
  return `${value > 0 ? "+" : "-"}${formatted}`;
}
