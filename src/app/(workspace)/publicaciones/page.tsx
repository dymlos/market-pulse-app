import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ClipboardPen,
  Clock3,
  ListFilter,
  MoreHorizontal,
  PackageSearch,
  Search,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ListingStatus } from "@/generated/prisma";
import {
  firstParam,
  formatCurrency,
  formatDate,
  formatRelativeDate,
  type SearchParamsInput,
} from "@/lib/format";
import {
  changeEventTypeLabels,
  listingStatusLabels,
  listingStatusOptions,
  listingStatusTone,
} from "@/lib/market-labels";
import {
  LISTING_LOW_STOCK_THRESHOLD,
  getListings,
  getProjectOptions,
  type ListingStockFilter,
  type ListingTrackingFilter,
} from "@/lib/market-data";

type PublicacionesPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

const trackingFilterOptions: { value: ListingTrackingFilter; label: string }[] = [
  { value: "WITH_CHANGES", label: "Con cambios registrados" },
  { value: "WITHOUT_CHANGES", label: "Sin cambios registrados" },
  { value: "WITH_SNAPSHOTS", label: "Con métricas cargadas" },
  { value: "WITHOUT_SNAPSHOTS", label: "Sin métricas cargadas" },
  { value: "WITH_ACTIVE_OPPORTUNITIES", label: "Con señales activas" },
];

const stockFilterOptions: { value: ListingStockFilter; label: string }[] = [
  { value: "LOW_STOCK", label: "Stock bajo" },
];

function parseListingStatus(value?: string) {
  return value && listingStatusOptions.includes(value as ListingStatus)
    ? (value as ListingStatus)
    : undefined;
}

function parseTrackingFilter(value?: string) {
  if (value === "WITH_OPPORTUNITIES") {
    return "WITH_ACTIVE_OPPORTUNITIES";
  }

  return trackingFilterOptions.some((option) => option.value === value)
    ? (value as ListingTrackingFilter)
    : undefined;
}

function parseStockFilter(value?: string) {
  return stockFilterOptions.some((option) => option.value === value)
    ? (value as ListingStockFilter)
    : undefined;
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getTrackingState(input: {
  latestSnapshotDate?: Date;
  latestChangeDate?: Date;
  availableStock?: number | null;
}) {
  if (!input.latestSnapshotDate) {
    return {
      label: "Sin snapshots",
      detail: "Faltan metricas para leer impacto.",
      tone: "danger" as const,
      icon: AlertTriangle,
    };
  }

  if (input.latestChangeDate && input.latestChangeDate > input.latestSnapshotDate) {
    return {
      label: "Cambio sin seguimiento",
      detail: "Conviene cargar un snapshot posterior.",
      tone: "warning" as const,
      icon: Clock3,
    };
  }

  const diffDays = Math.floor(
    (Date.now() - input.latestSnapshotDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays > 21) {
    return {
      label: "Seguimiento desactualizado",
      detail: `${formatRelativeDate(input.latestSnapshotDate)} sin datos nuevos.`,
      tone: "warning" as const,
      icon: Clock3,
    };
  }

  if (
    input.availableStock !== null &&
    input.availableStock !== undefined &&
    input.availableStock <= LISTING_LOW_STOCK_THRESHOLD
  ) {
    return {
      label: input.availableStock === 0 ? "Sin stock" : "Stock bajo",
      detail: "Revisar disponibilidad antes de interpretar ventas.",
      tone: "warning" as const,
      icon: AlertTriangle,
    };
  }

  return {
    label: "Seguimiento activo",
    detail: `${formatRelativeDate(input.latestSnapshotDate)} con metricas cargadas.`,
    tone: "success" as const,
    icon: Clock3,
  };
}

export default async function PublicacionesPage({ searchParams }: PublicacionesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const query = firstParam(params.q)?.trim() ?? "";
  const selectedStatus = parseListingStatus(firstParam(params.status));
  const legacyDataState = firstParam(params.dataState);
  const selectedTrackingState = parseTrackingFilter(
    firstParam(params.trackingState) ?? legacyDataState,
  );
  const selectedStockState =
    parseStockFilter(firstParam(params.stockState)) ??
    (legacyDataState === "LOW_STOCK" ? "LOW_STOCK" : undefined);
  const error = firstParam(params.error);
  const hasFilters = Boolean(
    selectedProjectId || query || selectedStatus || selectedTrackingState || selectedStockState,
  );

  const [projects, listings] = await Promise.all([
    getProjectOptions(),
    getListings({
      projectId: selectedProjectId || undefined,
      query,
      status: selectedStatus,
      trackingState: selectedTrackingState,
      stockState: selectedStockState,
    }),
  ]);

  const createHref = selectedProjectId
    ? `/publicaciones/nueva?projectId=${selectedProjectId}`
    : "/publicaciones/nueva";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Unidad de analisis"
        title="Publicaciones"
        description="Publicaciones propias que concentran memoria operativa: que se toco, que datos llegaron despues y que lectura probable queda para decidir la proxima accion."
      />

      <FormMessage message={error} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
            href={createHref}
          >
            Nueva publicacion
          </Link>
        }
        title="Seguimiento de publicaciones"
        description="Busca una publicacion, revisa si tiene cambios y snapshots recientes, y entra al analisis antes de volver a tocarla."
      >
        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_0.8fr_1fr_0.75fr_auto_auto] xl:items-end">
          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="q">
              Buscar
            </label>
            <div className="relative mt-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                className="w-full rounded-2xl border border-line bg-panel px-10 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/15"
                defaultValue={query}
                id="q"
                name="q"
                placeholder="Titulo, SKU o ID externo"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="projectId">
              Proyecto
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedProjectId}
              id="projectId"
              name="projectId"
            >
              <option value="">Todos los proyectos activos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="status">
              Estado
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedStatus ?? ""}
              id="status"
              name="status"
            >
              <option value="">Todos</option>
              {listingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {listingStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="trackingState">
              Estado de seguimiento
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedTrackingState ?? ""}
              id="trackingState"
              name="trackingState"
            >
              <option value="">Todas</option>
              {trackingFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="stockState">
              Stock
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedStockState ?? ""}
              id="stockState"
              name="stockState"
            >
              <option value="">Todos</option>
              {stockFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/55 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/15"
            type="submit"
          >
            <ListFilter className="h-4 w-4" aria-hidden="true" />
            Filtrar
          </button>
          {hasFilters ? (
            <Link
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
              href="/publicaciones"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {listings.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Publicacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Precio / stock
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Datos
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Seguimiento
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {listings.map((listing) => {
                    const latestChange = listing.changeEvents[0];
                    const latestSnapshot = listing.metricSnapshots[0];
                    const tracking = getTrackingState({
                      latestSnapshotDate: latestSnapshot?.snapshotDate,
                      latestChangeDate: latestChange?.occurredAt,
                      availableStock: listing.availableStock,
                    });
                    const TrackingIcon = tracking.icon;

                    return (
                      <tr key={listing.id} className="transition hover:bg-panel-raised/55">
                        <td className="px-4 py-3 text-sm text-ink">
                          <Link
                            className="inline-flex items-center gap-2 font-semibold text-ink hover:text-accent"
                            href={`/publicaciones/${listing.id}`}
                          >
                            <PackageSearch className="h-4 w-4 text-accent" aria-hidden="true" />
                            {listing.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted">
                            SKU {listing.sku || "sin dato"} - ID externo {listing.externalId || "sin dato"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          <Link
                            className="font-semibold text-ink hover:text-accent"
                            href={`/proyectos/${listing.projectId}`}
                          >
                            {listing.project.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <Badge tone={listingStatusTone(listing.status)}>
                            {listingStatusLabels[listing.status]}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          <div>{formatCurrency(listing.currentPrice, listing.project.currencyCode)}</div>
                          <p className="mt-1 text-xs text-muted">
                            Stock {listing.availableStock ?? "sin dato"}
                          </p>
                        </td>
                        <td className="min-w-72 px-4 py-3 text-sm text-ink">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              className="rounded-full border border-line bg-panel-raised px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                              href={`/cambios?listingId=${listing.id}`}
                            >
                              {countLabel(listing._count.changeEvents, "cambio", "cambios")}
                            </Link>
                            <Link
                              className="rounded-full border border-line bg-panel-raised px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                              href={`/publicaciones/${listing.id}#timeline-causal`}
                            >
                              {countLabel(listing._count.metricSnapshots, "snapshot", "snapshots")}
                            </Link>
                            {listing._count.opportunitySignals > 0 ? (
                              <Link
                                className="rounded-full border border-warning/35 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning transition hover:border-accent hover:text-accent"
                                href={`/oportunidades?listingId=${listing.id}`}
                              >
                                {countLabel(listing._count.opportunitySignals, "senal", "senales")}
                              </Link>
                            ) : null}
                          </div>
                          <div className="mt-2 space-y-1 text-xs leading-5 text-muted">
                            <p>
                              Ultimo cambio:{" "}
                              {latestChange
                                ? `${changeEventTypeLabels[latestChange.type]} - ${formatRelativeDate(latestChange.occurredAt)}`
                                : "sin cambios registrados"}
                            </p>
                            <p>
                              Ultimo snapshot:{" "}
                              {latestSnapshot
                                ? `${formatRelativeDate(latestSnapshot.snapshotDate)} - ${formatDate(latestSnapshot.snapshotDate)}`
                                : "sin metricas cargadas"}
                            </p>
                          </div>
                        </td>
                        <td className="min-w-56 px-4 py-3 text-sm">
                          <div className="flex items-start gap-2">
                            <TrackingIcon className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                            <div>
                              <Badge tone={tracking.tone}>{tracking.label}</Badge>
                              <p className="mt-2 text-xs leading-5 text-muted">{tracking.detail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-3 py-2 font-semibold text-shell transition hover:bg-accent/90"
                              href={`/publicaciones/${listing.id}`}
                            >
                              <BarChart3 className="h-4 w-4" aria-hidden="true" />
                              Abrir analisis
                            </Link>
                            <Link
                              className="inline-flex items-center gap-2 rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                              href={`/cambios/nuevo?listingId=${listing.id}&returnTo=${encodeURIComponent(
                                `/publicaciones/${listing.id}#timeline-causal`,
                              )}`}
                            >
                              <ClipboardPen className="h-4 w-4" aria-hidden="true" />
                              Registrar cambio
                            </Link>
                            <details className="group text-left">
                              <summary className="inline-flex list-none items-center gap-2 rounded-2xl border border-line px-3 py-2 font-semibold text-muted transition hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                Mas
                              </summary>
                              <div className="mt-2 min-w-48 rounded-2xl border border-line bg-shell p-2 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.95)]">
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/publicaciones/${listing.id}/editar`}
                                >
                                  Editar datos
                                </Link>
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/importaciones?projectId=${listing.projectId}`}
                                >
                                  Importar metricas
                                </Link>
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/publicaciones/${listing.id}#timeline-causal`}
                                >
                                  Ir al timeline
                                </Link>
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-5 py-7 text-sm leading-6 text-muted">
            {hasFilters ? (
              <>
                No hay publicaciones que coincidan con estos filtros. Ajusta la busqueda o limpia los
                filtros para volver al seguimiento completo.
              </>
            ) : (
              <>
                Todavia no hay publicaciones. Carga la primera publicacion propia para empezar a
                registrar cambios, importar snapshots metricos y construir una lectura antes/despues.
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell transition hover:bg-accent/90"
                    href={createHref}
                  >
                    Crear publicacion
                  </Link>
                  <Link
                    className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    href="/importaciones"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Importar metricas
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
