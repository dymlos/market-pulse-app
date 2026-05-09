import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  ListFilter,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { ChangeEventType } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  firstParam,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  type SearchParamsInput,
} from "@/lib/format";
import { changeEventTypeLabels, changeEventTypeOptions } from "@/lib/market-labels";
import {
  getChangeEvents,
  getListingOptions,
  getProjectOptions,
  type ChangeTimeFilter,
} from "@/lib/market-data";

type CambiosPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

function parseChangeEventType(value?: string) {
  return value && changeEventTypeOptions.includes(value as ChangeEventType)
    ? (value as ChangeEventType)
    : undefined;
}

const timeFilterOptions: { value: ChangeTimeFilter; label: string }[] = [
  { value: "LAST_7_DAYS", label: "Ultimos 7 dias" },
  { value: "LAST_30_DAYS", label: "Ultimos 30 dias" },
  { value: "THIS_MONTH", label: "Este mes" },
];

function parseTimeFilter(value?: string) {
  return timeFilterOptions.some((option) => option.value === value)
    ? (value as ChangeTimeFilter)
    : undefined;
}

function buildQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  const result = query.toString();
  return result ? `?${result}` : "";
}

function getFollowUpState(change: {
  occurredAt: Date;
  previousSnapshot: { snapshotDate: Date } | null;
  followUpSnapshot: { snapshotDate: Date } | null;
}) {
  if (change.previousSnapshot && change.followUpSnapshot) {
    return {
      label: "Lectura disponible",
      detail: `Antes ${formatDate(change.previousSnapshot.snapshotDate)} / despues ${formatDate(
        change.followUpSnapshot.snapshotDate,
      )}`,
      tone: "success" as const,
    };
  }

  if (change.followUpSnapshot) {
    return {
      label: "Con seguimiento",
      detail: `Snapshot posterior ${formatRelativeDate(change.followUpSnapshot.snapshotDate)}.`,
      tone: "success" as const,
    };
  }

  return {
    label: "Sin seguimiento",
    detail: "Falta un snapshot metrico posterior al cambio.",
    tone: "warning" as const,
  };
}

export default async function CambiosPage({ searchParams }: CambiosPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const selectedListingId = firstParam(params.listingId) || "";
  const selectedType = parseChangeEventType(firstParam(params.type));
  const selectedTimeframe = parseTimeFilter(firstParam(params.timeframe));
  const query = firstParam(params.q)?.trim() ?? "";
  const error = firstParam(params.error);
  const filterQuery = buildQueryString({
    projectId: selectedProjectId,
    listingId: selectedListingId,
    type: selectedType,
    timeframe: selectedTimeframe,
    q: query,
  });
  const hasFilters = Boolean(
    selectedProjectId || selectedListingId || selectedType || selectedTimeframe || query,
  );

  const [projects, listings, changes] = await Promise.all([
    getProjectOptions(),
    getListingOptions(selectedProjectId || undefined),
    getChangeEvents({
      projectId: selectedProjectId || undefined,
      listingId: selectedListingId || undefined,
      type: selectedType,
      timeframe: selectedTimeframe,
      query,
    }),
  ]);

  const createHref = selectedListingId
    ? `/cambios/nuevo?listingId=${selectedListingId}&returnTo=${encodeURIComponent(
        `/cambios${filterQuery}`,
      )}`
    : `/cambios/nuevo${filterQuery ? `?returnTo=${encodeURIComponent(`/cambios${filterQuery}`)}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Memoria operativa"
        title="Bitacora de cambios"
        description="Registra que se toco, cuando, por que y que esperabas observar despues. Cada cambio queda conectado a su publicacion y al timeline causal."
      />

      <FormMessage message={error} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
            href={createHref}
          >
            Registrar cambio
          </Link>
        }
        title="Cambios operativos"
        description="Busca decisiones recientes, revisa el antes/despues y detecta rapido que cambios todavia necesitan snapshots posteriores."
      >
        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr_auto_auto] xl:items-end">
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
                placeholder="Descripcion, publicacion, SKU o responsable"
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
              <option value="">Todos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="listingId">
              Publicacion
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedListingId}
              id="listingId"
              name="listingId"
            >
              <option value="">Todas</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="type">
              Tipo
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedType ?? ""}
              id="type"
              name="type"
            >
              <option value="">Todos</option>
              {changeEventTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {changeEventTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="timeframe">
              Periodo
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedTimeframe ?? ""}
              id="timeframe"
              name="timeframe"
            >
              <option value="">Todos</option>
              {timeFilterOptions.map((option) => (
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
              href="/cambios"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {changes.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Cambio
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Publicacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Antes / despues
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
                  {changes.map((change) => {
                    const followUp = getFollowUpState(change);
                    const hasBeforeAfter = change.previousValue || change.newValue;

                    return (
                      <tr key={change.id} className="transition hover:bg-panel-raised/55">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          <div className="font-semibold">{formatRelativeDate(change.occurredAt)}</div>
                          <p className="mt-1 text-xs text-muted">{formatDateTime(change.occurredAt)}</p>
                        </td>
                        <td className="min-w-72 px-4 py-3 text-sm text-ink">
                          <Badge>{changeEventTypeLabels[change.type]}</Badge>
                          <Link
                            className="mt-2 block font-semibold text-ink hover:text-accent"
                            href={`/cambios/${change.id}`}
                          >
                            {change.detail}
                          </Link>
                          {change.actorName || change.comment ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                              {change.actorName ? `${change.actorName} - ` : ""}
                              {change.comment ?? "sin comentario operativo"}
                            </p>
                          ) : null}
                        </td>
                        <td className="min-w-64 px-4 py-3 text-sm text-ink">
                          <Link
                            className="font-semibold text-ink hover:text-accent"
                            href={`/publicaciones/${change.listingId}`}
                          >
                            {change.listing.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted">
                            {change.listing.project.name}
                            {change.listing.sku ? ` - SKU ${change.listing.sku}` : ""}
                          </p>
                        </td>
                        <td className="min-w-56 px-4 py-3 text-sm text-ink">
                          {hasBeforeAfter ? (
                            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-line bg-panel-raised px-3 py-2">
                              <span className="truncate text-muted">
                                {change.previousValue ?? "sin dato"}
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                              <span className="truncate font-semibold">
                                {change.newValue ?? "sin dato"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs leading-5 text-muted">
                              Sin valores antes/despues cargados.
                            </span>
                          )}
                        </td>
                        <td className="min-w-56 px-4 py-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Clock3 className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                            <div>
                              <Badge tone={followUp.tone}>{followUp.label}</Badge>
                              <p className="mt-2 text-xs leading-5 text-muted">{followUp.detail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-3 py-2 font-semibold text-shell transition hover:bg-accent/90"
                              href={`/cambios/${change.id}`}
                            >
                              <BarChart3 className="h-4 w-4" aria-hidden="true" />
                              Abrir cambio
                            </Link>
                            <details className="group text-left">
                              <summary className="inline-flex list-none items-center gap-2 rounded-2xl border border-line px-3 py-2 font-semibold text-muted transition hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                Mas
                              </summary>
                              <div className="mt-2 min-w-48 rounded-2xl border border-line bg-shell p-2 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.95)]">
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/publicaciones/${change.listingId}#timeline-causal`}
                                >
                                  Ver timeline
                                </Link>
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/importaciones?projectId=${change.listing.project.id}`}
                                >
                                  Cargar metricas
                                </Link>
                                <Link
                                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                  href={`/cambios/${change.id}/editar`}
                                >
                                  Editar memoria
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
                No hay cambios que coincidan con estos filtros. Ajusta la busqueda o limpia los
                filtros para volver a la bitacora completa.
              </>
            ) : (
              <>
                Todavia no hay cambios registrados. Guarda la ultima decision operativa sobre una
                publicacion para poder comparar despues que paso en visitas, ventas, conversion o
                posicion.
                <div className="mt-4">
                  <Link
                    className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell transition hover:bg-accent/90"
                    href="/cambios/nuevo"
                  >
                    Registrar primer cambio
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
