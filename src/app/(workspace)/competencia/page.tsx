import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatDateTime, type SearchParamsInput } from "@/lib/format";
import { getProjectOptions, getTrackedSearches } from "@/lib/market-data";

type CompetenciaPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function CompetenciaPage({ searchParams }: CompetenciaPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const error = firstParam(params.error);

  const [projects, trackedSearches] = await Promise.all([
    getProjectOptions(),
    getTrackedSearches(selectedProjectId || undefined),
  ]);

  const createHref = selectedProjectId
    ? `/competencia/nueva?projectId=${selectedProjectId}`
    : "/competencia/nueva";

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
            className="inline-flex rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            href={createHref}
          >
            Nueva busqueda
          </Link>
        }
        title="Busquedas monitoreadas"
        description="Lista de queries criticas que despues podran aportar contexto al timeline causal."
      >
        <form className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold text-ink" htmlFor="projectId">
              Proyecto
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
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
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            type="submit"
          >
            Filtrar
          </button>
          {selectedProjectId ? (
            <Link
              className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-accent hover:text-accent"
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
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Busqueda
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Snapshots
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Ultimo snapshot
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {trackedSearches.map((trackedSearch) => (
                    <tr key={trackedSearch.id}>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/competencia/${trackedSearch.id}`}>
                          {trackedSearch.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{trackedSearch.query}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {trackedSearch.project.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={trackedSearch.isActive ? "success" : "muted"}>
                          {trackedSearch.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {trackedSearch._count.snapshots}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
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
          <div className="rounded-2xl border border-line bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            Todavia no hay busquedas monitoreadas para este filtro.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
