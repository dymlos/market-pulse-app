import Link from "next/link";

import { CompetitorForm } from "@/components/forms/competitor-form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatDateTime, type SearchParamsInput } from "@/lib/format";
import { createCompetitor } from "@/lib/market-actions";
import { getCompetitors, getProjectOptions, getTrackedSearches } from "@/lib/market-data";

type CompetenciaPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function CompetenciaPage({ searchParams }: CompetenciaPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const error = firstParam(params.error);

  const [projects, trackedSearches, competitors] = await Promise.all([
    getProjectOptions(),
    getTrackedSearches(selectedProjectId || undefined),
    getCompetitors(selectedProjectId || undefined),
  ]);

  const createHref = selectedProjectId
    ? `/competencia/nueva?projectId=${selectedProjectId}`
    : "/competencia/nueva";
  const currentHref = selectedProjectId ? `/competencia?projectId=${selectedProjectId}` : "/competencia";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contexto complementario"
        title="Competencia"
        description="Version minima: busquedas monitoreadas y snapshots manuales existentes. Sirve como contexto, no como suite competitiva."
      />

      <FormMessage message={error} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
            href={createHref}
          >
            Nueva busqueda
          </Link>
        }
        title="Busquedas monitoreadas"
        description="Lista de queries criticas que despues podran aportar contexto al timeline causal."
      >
        <form className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-panel-raised p-4 md:flex-row md:items-end">
          <div className="flex-1">
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
          <button
            className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            type="submit"
          >
            Filtrar
          </button>
          {selectedProjectId ? (
            <Link
              className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
              href="/competencia"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {trackedSearches.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Busqueda
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Snapshots
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Ultimo snapshot
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {trackedSearches.map((trackedSearch) => (
                    <tr key={trackedSearch.id}>
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/competencia/${trackedSearch.id}`}>
                          {trackedSearch.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted">{trackedSearch.query}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {trackedSearch.project.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={trackedSearch.isActive ? "success" : "muted"}>
                          {trackedSearch.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {trackedSearch._count.snapshots}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {trackedSearch.snapshots[0]
                          ? formatDateTime(trackedSearch.snapshots[0].capturedAt)
                          : "Sin snapshot"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <Link
                          className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                          href={`/competencia/${trackedSearch.id}`}
                        >
                          Ver snapshots
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-6 text-sm leading-6 text-muted">
            Todavia no hay busquedas monitoreadas para este filtro.
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Competidores"
        description="Registro simple para reutilizar nombres al cargar resultados observados. No es un perfil competitivo avanzado."
      >
        <CompetitorForm
          action={createCompetitor}
          projects={projects}
          returnTo={currentHref}
          selectedProjectId={selectedProjectId}
        />

        <div className="mt-6">
          {competitors.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-panel-raised">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Competidor
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Proyecto
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Seller
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Resultados vinculados
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-panel">
                    {competitors.map((competitor) => (
                      <tr key={competitor.id}>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-semibold text-ink">{competitor.name}</div>
                          {competitor.notes ? (
                            <p className="mt-1 text-xs leading-5 text-muted">{competitor.notes}</p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {competitor.project.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {competitor.sellerHandle ?? competitor.marketplaceSellerId ?? "Sin dato"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {competitor._count.searchResultItems}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-6 text-sm leading-6 text-muted">
              Todavia no hay competidores para este filtro.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
