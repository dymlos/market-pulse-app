import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingCausalTimeline } from "@/components/listings/listing-causal-timeline";
import { ListingHeuristicInsights } from "@/components/listings/listing-heuristic-insights";
import { ListingMetricSummaryPanel } from "@/components/listings/listing-metric-summary";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  buildListingMetricSummary,
  buildListingTimeline,
  generateListingHeuristicInsights,
} from "@/lib/causal-timeline";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import {
  changeEventTypeLabels,
  listingStatusLabels,
  listingStatusTone,
} from "@/lib/market-labels";
import { getListingDetail } from "@/lib/market-data";

type PublicacionDetallePageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function PublicacionDetallePage({ params }: PublicacionDetallePageProps) {
  const { listingId } = await params;
  const listing = await getListingDetail(listingId);

  if (!listing) {
    notFound();
  }

  const timelineItems = buildListingTimeline({
    changes: listing.changeEvents,
    snapshots: listing.metricSnapshots,
  });
  const metricSummary = buildListingMetricSummary({
    changes: listing.changeEvents,
    snapshots: listing.metricSnapshots,
  });
  const heuristicInsights = generateListingHeuristicInsights({
    changes: listing.changeEvents,
    snapshots: listing.metricSnapshots,
  });
  const recentChanges = listing.changeEvents.slice(0, 6);
  const recentSnapshots = listing.metricSnapshots.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de publicacion"
        title={listing.title}
        description="Vista operativa para leer cambios, snapshots, timeline causal e impacto probable con confianza prudente."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href="#timeline-causal"
              >
                Ver timeline
              </Link>
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href={`/publicaciones/${listing.id}/editar`}
              >
                Editar
              </Link>
            </div>
          }
          title="Datos basicos"
          description="Referencia operativa actual y punto de entrada al timeline causal."
        >
          <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Proyecto
              </dt>
              <dd className="mt-2 font-semibold text-ink">{listing.project.name}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Estado
              </dt>
              <dd className="mt-2">
                <Badge tone={listingStatusTone(listing.status)}>
                  {listingStatusLabels[listing.status]}
                </Badge>
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Precio / stock
              </dt>
              <dd className="mt-2 font-semibold text-ink">
                {formatCurrency(listing.currentPrice, listing.project.currencyCode)} /{" "}
                {listing.availableStock ?? "Sin stock"}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                SKU / ID externo
              </dt>
              <dd className="mt-2 font-semibold text-ink">
                {listing.sku || listing.externalId || "Sin dato"}
              </dd>
            </div>
          </dl>
          {listing.notes ? (
            <p className="mt-5 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
              {listing.notes}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
              href={`/cambios/nuevo?listingId=${listing.id}`}
            >
              Registrar cambio
            </Link>
          }
          eyebrow="Bitacora"
          title="Ultimos cambios"
          description="Eventos operativos recientes vinculados directamente a esta publicacion."
        >
          {recentChanges.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
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
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {recentChanges.map((change) => (
                    <tr key={change.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatDateTime(change.occurredAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge>{changeEventTypeLabels[change.type]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/cambios/${change.id}`}>
                          {change.detail}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
              Todavia no hay cambios registrados para esta publicacion.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Resumen"
        title="Resumen operativo de metricas"
        description="Conteos, ultima fecha cargada, metricas recientes y variacion entre el primer y ultimo snapshot visible."
      >
        <ListingMetricSummaryPanel summary={metricSummary} currencyCode={listing.project.currencyCode} />
      </SectionCard>

      <SectionCard
        eyebrow="Lectura probable"
        title="Insights heuristicos"
        description="Reglas simples y honestas para orientar la revision. No afirma causalidad exacta."
      >
        <ListingHeuristicInsights
          heuristicInsights={heuristicInsights}
          storedInsights={listing.insights}
        />
      </SectionCard>

      <SectionCard
        eyebrow="Timeline"
        title="Timeline causal"
        description="Secuencia cronologica que mezcla cambios manuales y snapshots metricos para leer el antes y despues."
      >
        <div id="timeline-causal">
          <ListingCausalTimeline items={timelineItems} currencyCode={listing.project.currencyCode} />
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Metricas"
        title="Ultimos snapshots metricos"
        description="Ultimas filas metricas disponibles como apoyo a la lectura del timeline."
      >
        {recentSnapshots.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Visitas
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Conversion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Facturacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Nota
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {recentSnapshots.map((snapshot) => (
                    <tr key={snapshot.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatDate(snapshot.snapshotDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatNumber(snapshot.visits)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatNumber(snapshot.salesUnits)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatPercent(snapshot.conversionRate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatCurrency(snapshot.revenue, listing.project.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {snapshot.notes ?? "Sin nota"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
            Todavia no hay snapshots metricos para esta publicacion.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
