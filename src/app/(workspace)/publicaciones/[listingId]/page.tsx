import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AlertTriangle, Clock3, ClipboardPen, Upload } from "lucide-react";

import { ListingCausalTimeline } from "@/components/listings/listing-causal-timeline";
import { ListingHeuristicInsights } from "@/components/listings/listing-heuristic-insights";
import { ListingMetricSummaryPanel } from "@/components/listings/listing-metric-summary";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
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
  formatRelativeDate,
  firstParam,
  type SearchParamsInput,
} from "@/lib/format";
import {
  changeEventTypeLabels,
  listingStatusLabels,
  listingStatusTone,
} from "@/lib/market-labels";
import { getListingDetail } from "@/lib/market-data";

type PublicacionDetallePageProps = {
  params: Promise<{ listingId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

const confidenceLabels = {
  LOW: "confianza baja",
  MEDIUM: "confianza media",
  HIGH: "confianza alta",
};

function getDetailTrackingState(input: {
  latestSnapshotDate?: Date;
  latestChangeDate?: Date;
  availableStock?: number | null;
}) {
  if (!input.latestSnapshotDate) {
    return {
      label: "Sin snapshots",
      detail: "Todavia no hay metricas para comparar antes y despues.",
      tone: "danger" as const,
      icon: <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />,
    };
  }

  if (input.latestChangeDate && input.latestChangeDate > input.latestSnapshotDate) {
    return {
      label: "Cambio sin seguimiento",
      detail: "Hay un cambio posterior al ultimo snapshot. Conviene importar metricas nuevas.",
      tone: "warning" as const,
      icon: <Clock3 className="h-4 w-4 text-warning" aria-hidden="true" />,
    };
  }

  const diffDays = Math.floor(
    (Date.now() - input.latestSnapshotDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays > 21) {
    return {
      label: "Seguimiento desactualizado",
      detail: `El ultimo snapshot es de ${formatRelativeDate(input.latestSnapshotDate)}.`,
      tone: "warning" as const,
      icon: <Clock3 className="h-4 w-4 text-warning" aria-hidden="true" />,
    };
  }

  if (input.availableStock !== null && input.availableStock !== undefined && input.availableStock <= 5) {
    return {
      label: input.availableStock === 0 ? "Sin stock" : "Stock bajo",
      detail: "La lectura de ventas puede estar condicionada por disponibilidad.",
      tone: "warning" as const,
      icon: <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />,
    };
  }

  return {
    label: "Seguimiento activo",
    detail: "Hay metricas recientes para sostener la lectura operativa.",
    tone: "success" as const,
    icon: <Clock3 className="h-4 w-4 text-success" aria-hidden="true" />,
  };
}

export default async function PublicacionDetallePage({
  params,
  searchParams,
}: PublicacionDetallePageProps) {
  const { listingId } = await params;
  const query = (await searchParams) ?? {};
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
  const latestChange = listing.changeEvents[0];
  const latestSnapshot = listing.metricSnapshots[0];
  const primaryInsight = heuristicInsights[0];
  const tracking = getDetailTrackingState({
    latestSnapshotDate: latestSnapshot?.snapshotDate,
    latestChangeDate: latestChange?.occurredAt,
    availableStock: listing.availableStock,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analisis de publicacion"
        title={listing.title}
        description="Vista de trabajo para entender que se toco, que paso despues en metricas y que explicacion probable conviene usar para la proxima accion."
      />

      {firstParam(query.created) ? (
        <FormMessage
          tone="success"
          message="Publicacion creada. El siguiente paso util es registrar un cambio o importar metricas para iniciar el seguimiento."
        />
      ) : null}
      {firstParam(query.updated) ? (
        <FormMessage tone="success" message="Publicacion actualizada correctamente." />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href="/publicaciones"
              >
                Volver
              </Link>
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href={`/publicaciones/${listing.id}/editar`}
              >
                Editar
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href={`/importaciones?projectId=${listing.projectId}`}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Importar metricas
              </Link>
            </div>
          }
          title="Resumen operativo"
          description="Lectura rapida de estado, seguimiento y evidencia disponible antes de revisar el detalle."
        >
          <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-1">
            <InfoTile label="Proyecto">
              <Link className="font-semibold text-ink hover:text-accent" href={`/proyectos/${listing.projectId}`}>
                {listing.project.name}
              </Link>
            </InfoTile>
            <InfoTile label="Estado">
              <Badge tone={listingStatusTone(listing.status)}>
                {listingStatusLabels[listing.status]}
              </Badge>
            </InfoTile>
            <InfoTile
              label="Precio / stock"
              detail={`SKU ${listing.sku || "sin dato"} - ID externo ${listing.externalId || "sin dato"}`}
            >
              {formatCurrency(listing.currentPrice, listing.project.currencyCode)} /{" "}
              {listing.availableStock ?? "Sin stock"}
            </InfoTile>
            <InfoTile
              label="Ultimo cambio"
              detail={latestChange ? latestChange.detail : "Registrar cambios mejora la memoria causal."}
            >
              {latestChange
                ? `${changeEventTypeLabels[latestChange.type]} - ${formatRelativeDate(latestChange.occurredAt)}`
                : "Sin cambios"}
            </InfoTile>
            <InfoTile
              label="Ultimo snapshot"
              detail={latestSnapshot ? formatDate(latestSnapshot.snapshotDate) : "Importa metricas para iniciar lectura."}
            >
              {latestSnapshot ? formatRelativeDate(latestSnapshot.snapshotDate) : "Sin datos"}
            </InfoTile>
            <InfoTile label="Seguimiento" detail={tracking.detail} icon={tracking.icon}>
              <Badge tone={tracking.tone}>{tracking.label}</Badge>
            </InfoTile>
            <InfoTile
              label="Lectura actual"
              detail={primaryInsight?.summary ?? "Faltan datos para generar una lectura."}
            >
              {primaryInsight ? (
                <span className="inline-flex flex-wrap gap-2">
                  <Badge>{primaryInsight.category}</Badge>
                  <Badge>{confidenceLabels[primaryInsight.confidence]}</Badge>
                </span>
              ) : (
                "Sin lectura"
              )}
            </InfoTile>
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
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
              href={`/cambios/nuevo?listingId=${listing.id}&returnTo=${encodeURIComponent(
                `/publicaciones/${listing.id}#timeline-causal`,
              )}`}
            >
              <ClipboardPen className="h-4 w-4" aria-hidden="true" />
              Registrar cambio
            </Link>
          }
          eyebrow="Bitacora"
          title="Ultimos cambios"
          description="Memoria operativa reciente: que se toco, cuando y con que intencion registrada."
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
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-4 text-sm leading-6 text-muted">
              Todavia no hay cambios registrados para esta publicacion. Registrar el primer cambio
              permite leer el antes y despues cuando entren snapshots metricos.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Resumen"
        title="Resumen operativo de metricas"
        description="Compara el primer snapshot visible con el ultimo snapshot cargado para mostrar variaciones simples y prudentes."
      >
        <ListingMetricSummaryPanel summary={metricSummary} currencyCode={listing.project.currencyCode} />
        {metricSummary.snapshotCount < 2 ? (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-warning/35 bg-warning/10 px-4 py-4 text-sm leading-6 text-warning md:flex-row md:items-center md:justify-between">
            <p>
              Para una comparacion util hacen falta al menos dos snapshots de esta publicacion.
            </p>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-warning/45 px-4 py-2 font-semibold text-warning transition hover:border-accent hover:text-accent"
              href={`/importaciones?projectId=${listing.projectId}`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Importar metricas
            </Link>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        eyebrow="Lectura probable"
        title="Insights heuristicos"
        description="Reglas simples y honestas para orientar la revision. No afirman causalidad exacta."
      >
        <ListingHeuristicInsights
          heuristicInsights={heuristicInsights}
          storedInsights={listing.insights}
        />
      </SectionCard>

      <SectionCard
        eyebrow="Timeline"
        title="Timeline causal"
        description="Secuencia del mas antiguo al mas reciente: primero se entiende el antes, despues los cambios, y luego los datos posteriores."
      >
        <div id="timeline-causal">
          <ListingCausalTimeline items={timelineItems} currencyCode={listing.project.currencyCode} />
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Metricas"
        title="Ultimos snapshots metricos"
        description="Ultimas filas metricas disponibles como evidencia puntual para sostener o discutir la lectura del timeline."
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
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel-raised px-4 py-4 text-sm leading-6 text-muted md:flex-row md:items-center md:justify-between">
            <p>
              Todavia no hay snapshots metricos para esta publicacion. Sin datos, el timeline solo
              puede conservar memoria de cambios.
            </p>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/importaciones?projectId=${listing.projectId}`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Importar metricas
            </Link>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function InfoTile({
  label,
  detail,
  icon,
  children,
}: {
  label: string;
  detail?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-ink">{children}</dd>
      {detail ? <dd className="mt-2 text-xs leading-5 text-muted">{detail}</dd> : null}
    </div>
  );
}
