import { Badge } from "@/components/ui/badge";
import type { ListingTimelineItem } from "@/lib/causal-timeline";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { changeEventTypeLabels } from "@/lib/market-labels";

type ListingCausalTimelineProps = {
  items: ListingTimelineItem[];
  currencyCode: string;
};

export function ListingCausalTimeline({ items, currencyCode }: ListingCausalTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
        Todavia no hay cambios ni snapshots metricos para construir una secuencia causal.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-panel-raised">
            <tr>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Fecha
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Tipo
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Lectura
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {items.map((item) => (
              <tr key={`${item.kind}-${item.id}`}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                  {item.kind === "change" ? formatDateTime(item.date) : formatDate(item.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {item.kind === "change" ? (
                    <div className="flex flex-col gap-2">
                      <Badge>Cambio manual</Badge>
                      <span className="text-xs text-muted">
                        {changeEventTypeLabels[item.eventType as keyof typeof changeEventTypeLabels] ??
                          item.eventType}
                      </span>
                    </div>
                  ) : (
                    <Badge tone="muted">Snapshot metrico</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-ink">
                  {item.kind === "change" ? (
                    <ChangeTimelineContent item={item} />
                  ) : (
                    <SnapshotTimelineContent item={item} currencyCode={currencyCode} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChangeTimelineContent({ item }: { item: Extract<ListingTimelineItem, { kind: "change" }> }) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-ink">{item.detail}</div>
      {item.previousValue || item.newValue ? (
        <div className="text-xs leading-5 text-muted">
          Antes: {item.previousValue ?? "no informado"} / Despues:{" "}
          {item.newValue ?? "no informado"}
        </div>
      ) : null}
      {item.actorName ? <div className="text-xs text-muted">Responsable: {item.actorName}</div> : null}
      {item.hypothesis ? (
        <p className="text-xs leading-5 text-muted">Hipotesis registrada: {item.hypothesis}</p>
      ) : null}
    </div>
  );
}

function SnapshotTimelineContent({
  item,
  currencyCode,
}: {
  item: Extract<ListingTimelineItem, { kind: "snapshot" }>;
  currencyCode: string;
}) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-ink">
        {formatNumber(item.visits)} visitas / {formatNumber(item.salesUnits)} ventas /{" "}
        {formatPercent(item.conversionRate)} conversion
      </div>
      <div className="text-xs leading-5 text-muted">
        Precio: {formatCurrency(item.price, currencyCode)} / Stock: {formatNumber(item.availableStock)} /
        Facturacion: {formatCurrency(item.revenue, currencyCode)} / Ads:{" "}
        {formatCurrency(item.adSpend, currencyCode)}
      </div>
      {item.notes ? <p className="text-xs leading-5 text-muted">Nota: {item.notes}</p> : null}
    </div>
  );
}
