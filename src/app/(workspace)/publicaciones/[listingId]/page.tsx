import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de publicacion"
        title={listing.title}
        description="Vista simple para conectar proyecto, cambios recientes y snapshots metricos disponibles."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/publicaciones/${listing.id}/editar`}
            >
              Editar
            </Link>
          }
          title="Datos basicos"
          description="Referencia operativa actual, sin intentar explicar impacto todavia."
        >
          <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Proyecto
              </dt>
              <dd className="mt-2 font-semibold text-ink">{listing.project.name}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Estado
              </dt>
              <dd className="mt-2">
                <Badge tone={listingStatusTone(listing.status)}>
                  {listingStatusLabels[listing.status]}
                </Badge>
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Precio / stock
              </dt>
              <dd className="mt-2 font-semibold text-ink">
                {formatCurrency(listing.currentPrice, listing.project.currencyCode)} /{" "}
                {listing.availableStock ?? "Sin stock"}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                SKU / ID externo
              </dt>
              <dd className="mt-2 font-semibold text-ink">
                {listing.sku || listing.externalId || "Sin dato"}
              </dd>
            </div>
          </dl>
          {listing.notes ? (
            <p className="mt-5 rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              {listing.notes}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              href={`/cambios/nuevo?listingId=${listing.id}`}
            >
              Registrar cambio
            </Link>
          }
          eyebrow="Bitacora"
          title="Ultimos cambios"
          description="Eventos operativos recientes vinculados directamente a esta publicacion."
        >
          {listing.changeEvents.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {listing.changeEvents.map((change) => (
                    <tr key={change.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatDateTime(change.occurredAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge>{changeEventTypeLabels[change.type]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
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
            <p className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Todavia no hay cambios registrados para esta publicacion.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Metricas"
        title="Ultimos snapshots metricos"
        description="Lectura tabular basica. Los graficos y comparaciones antes/despues quedan para el timeline causal."
      >
        {listing.metricSnapshots.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Visitas
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Conversion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Facturacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Nota
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {listing.metricSnapshots.map((snapshot) => (
                    <tr key={snapshot.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatDate(snapshot.snapshotDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatNumber(snapshot.visits)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatNumber(snapshot.salesUnits)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatPercent(snapshot.conversionRate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatCurrency(snapshot.revenue, listing.project.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {snapshot.notes ?? "Sin nota"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Todavia no hay snapshots metricos para esta publicacion.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
