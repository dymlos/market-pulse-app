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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-xs leading-5 text-muted">
        <Badge>Cambio manual</Badge>
        <span>Accion propia registrada por el equipo.</span>
        <Badge tone="muted">Snapshot metrico</Badge>
        <span>Dato observado que ayuda a leer el antes y despues.</span>
      </div>

      <ol className="space-y-3">
        {items.map((item) => {
          const isChange = item.kind === "change";
          return (
            <li
              key={`${item.kind}-${item.id}`}
              className={[
                "rounded-2xl border px-4 py-4",
                isChange
                  ? "border-accent/45 bg-accent/10"
                  : "border-line bg-panel-raised",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {isChange ? formatDateTime(item.date) : formatDate(item.date)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isChange ? (
                      <>
                        <Badge>Cambio manual</Badge>
                        <Badge tone="muted">
                          {changeEventTypeLabels[item.eventType as keyof typeof changeEventTypeLabels] ??
                            item.eventType}
                        </Badge>
                      </>
                    ) : (
                      <Badge tone="muted">Snapshot metrico</Badge>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1 text-sm text-ink md:max-w-[72%]">
                  {isChange ? (
                    <ChangeTimelineContent item={item} />
                  ) : (
                    <SnapshotTimelineContent item={item} currencyCode={currencyCode} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
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
