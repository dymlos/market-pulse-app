import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { OpportunitySeverity, OpportunityStatus } from "@/generated/prisma";
import { firstParam, formatDateTime, type SearchParamsInput } from "@/lib/format";
import {
  opportunitySeverityLabels,
  opportunitySeverityOptions,
  opportunitySeverityTone,
  opportunityStatusLabels,
  opportunityStatusOptions,
  opportunityStatusTone,
  opportunityTypeLabels,
} from "@/lib/market-labels";
import { detectOpportunitySignalsAction, updateOpportunitySignalStatus } from "@/lib/market-actions";
import {
  getListingOptions,
  getOpportunitySignals,
  getProjectOptions,
  getTrackedSearches,
} from "@/lib/market-data";

type OportunidadesPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function OportunidadesPage({ searchParams }: OportunidadesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const selectedListingId = firstParam(params.listingId) || "";
  const selectedTrackedSearchId = firstParam(params.trackedSearchId) || "";
  const selectedSeverity = coerceOpportunitySeverity(firstParam(params.severity));
  const selectedStatus = coerceOpportunityStatus(firstParam(params.status));
  const error = firstParam(params.error);
  const generated = firstParam(params.generated);
  const candidates = firstParam(params.candidates);
  const existing = firstParam(params.existing);
  const updated = firstParam(params.updated);
  const currentHref = buildCurrentHref({
    projectId: selectedProjectId,
    listingId: selectedListingId,
    trackedSearchId: selectedTrackedSearchId,
    severity: selectedSeverity,
    status: selectedStatus,
  });

  const [projects, listings, trackedSearches, opportunitySignals] = await Promise.all([
    getProjectOptions(),
    getListingOptions(selectedProjectId || undefined),
    getTrackedSearches(selectedProjectId || undefined),
    getOpportunitySignals({
      projectId: selectedProjectId || undefined,
      listingId: selectedListingId || undefined,
      trackedSearchId: selectedTrackedSearchId || undefined,
      severity: selectedSeverity,
      status: selectedStatus,
    }),
  ]);

  const sortedSignals = [...opportunitySignals].sort((left, right) => {
    const severityDiff = severityRank(right.severity) - severityRank(left.severity);
    if (severityDiff !== 0) {
      return severityDiff;
    }

    return right.detectedAt.getTime() - left.detectedAt.getTime();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capa accionable"
        title="Oportunidades"
        description="Senales operativas derivadas de metricas, cambios y contexto competitivo cargado. Son alertas explicables, no recomendaciones automaticas ni scoring opaco."
      />

      <FormMessage message={error} />

      {generated !== undefined ? (
        <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
          Deteccion ejecutada: {generated} senales nuevas, {existing ?? "0"} ya existentes,
          {" "}{candidates ?? "0"} candidatas evaluadas.
        </div>
      ) : null}

      {updated ? (
        <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
          Estado de senal actualizado.
        </div>
      ) : null}

      <SectionCard
        action={
          <form action={detectOpportunitySignalsAction}>
            <input name="projectId" type="hidden" value={selectedProjectId} />
            <input name="returnTo" type="hidden" value={currentHref} />
            <button
              className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
              type="submit"
            >
              Detectar senales
            </button>
          </form>
        }
        title="Senales detectadas"
        description="Usa los filtros para revisar el contexto operativo y marcar lo que ya fue visto o descartado."
      >
        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 md:grid-cols-2 xl:grid-cols-5">
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
            <label className="text-sm font-semibold text-ink" htmlFor="trackedSearchId">
              Busqueda
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedTrackedSearchId}
              id="trackedSearchId"
              name="trackedSearchId"
            >
              <option value="">Todas</option>
              {trackedSearches.map((trackedSearch) => (
                <option key={trackedSearch.id} value={trackedSearch.id}>
                  {trackedSearch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="severity">
              Prioridad
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={selectedSeverity ?? ""}
              id="severity"
              name="severity"
            >
              <option value="">Todas</option>
              {opportunitySeverityOptions.map((severity) => (
                <option key={severity} value={severity}>
                  {opportunitySeverityLabels[severity]}
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
              {opportunityStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {opportunityStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 md:col-span-2 xl:col-span-5">
            <button
              className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              type="submit"
            >
              Filtrar
            </button>
            <Link
              className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
              href="/oportunidades"
            >
              Limpiar
            </Link>
          </div>
        </form>

        {sortedSignals.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Senal
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Vinculos
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Detectada
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {sortedSignals.map((signal) => (
                    <tr key={signal.id}>
                      <td className="min-w-[360px] px-4 py-4 align-top text-sm">
                        <div className="flex flex-wrap gap-2">
                          <Badge>{opportunityTypeLabels[signal.type]}</Badge>
                          <Badge tone={opportunitySeverityTone(signal.severity)}>
                            {`prioridad ${opportunitySeverityLabels[signal.severity]}`}
                          </Badge>
                        </div>
                        <p className="mt-3 max-w-3xl leading-6 text-muted">{signal.explanation}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-ink">
                        {signal.project.name}
                      </td>
                      <td className="min-w-[240px] px-4 py-4 align-top text-sm text-muted">
                        <div className="space-y-2">
                          {signal.listing ? (
                            <Link
                              className="block font-semibold text-ink hover:text-accent"
                              href={`/publicaciones/${signal.listing.id}`}
                            >
                              {signal.listing.title}
                            </Link>
                          ) : (
                            <span className="block">Sin publicacion vinculada</span>
                          )}
                          {signal.trackedSearch ? (
                            <Link
                              className="block font-semibold text-ink hover:text-accent"
                              href={`/competencia/${signal.trackedSearch.id}`}
                            >
                              {signal.trackedSearch.name}
                            </Link>
                          ) : (
                            <span className="block">Sin busqueda vinculada</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-ink">
                        {formatDateTime(signal.detectedAt)}
                      </td>
                      <td className="min-w-[220px] px-4 py-4 align-top text-sm">
                        <div className="mb-3">
                          <Badge tone={opportunityStatusTone(signal.status)}>
                            {opportunityStatusLabels[signal.status]}
                          </Badge>
                        </div>
                        <form action={updateOpportunitySignalStatus} className="flex flex-wrap gap-2">
                          <input name="opportunitySignalId" type="hidden" value={signal.id} />
                          <input name="returnTo" type="hidden" value={currentHref} />
                          <select
                            className="rounded-2xl border border-line bg-panel-raised px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                            defaultValue={signal.status}
                            name="status"
                          >
                            {opportunityStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {opportunityStatusLabels[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            type="submit"
                          >
                            Guardar
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-6 text-sm leading-6 text-muted">
            No hay senales para este filtro. Ejecuta la deteccion o cambia los filtros para revisar
            senales guardadas con otro estado.
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function coerceOpportunitySeverity(value: string | undefined) {
  return Object.values(OpportunitySeverity).includes(value as OpportunitySeverity)
    ? (value as OpportunitySeverity)
    : undefined;
}

function coerceOpportunityStatus(value: string | undefined) {
  return Object.values(OpportunityStatus).includes(value as OpportunityStatus)
    ? (value as OpportunityStatus)
    : undefined;
}

function buildCurrentHref(filters: {
  projectId: string;
  listingId: string;
  trackedSearchId: string;
  severity?: OpportunitySeverity;
  status?: OpportunityStatus;
}) {
  const params = new URLSearchParams();

  if (filters.projectId) {
    params.set("projectId", filters.projectId);
  }
  if (filters.listingId) {
    params.set("listingId", filters.listingId);
  }
  if (filters.trackedSearchId) {
    params.set("trackedSearchId", filters.trackedSearchId);
  }
  if (filters.severity) {
    params.set("severity", filters.severity);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `/oportunidades?${query}` : "/oportunidades";
}

function severityRank(severity: OpportunitySeverity) {
  if (severity === OpportunitySeverity.HIGH) {
    return 3;
  }

  if (severity === OpportunitySeverity.MEDIUM) {
    return 2;
  }

  return 1;
}
