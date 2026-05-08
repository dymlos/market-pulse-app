import Link from "next/link";
import { FolderOpen, ListFilter, Search } from "lucide-react";

import { ArchiveProjectForm } from "@/components/projects/archive-project-form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ProjectStatus } from "@/generated/prisma";
import { firstParam, formatDate, formatRelativeDate, type SearchParamsInput } from "@/lib/format";
import {
  marketplaceLabel,
  marketplaceOptions,
  projectStatusLabels,
  projectStatusTone,
} from "@/lib/market-labels";
import { getProjectMarketplaceFilters, getProjects } from "@/lib/market-data";

type ProyectosPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function ProyectosPage({ searchParams }: ProyectosPageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const marketplace = firstParam(params.marketplace) ?? "";
  const rawStatus = firstParam(params.status) ?? "ACTIVE_FLOW";
  const status = Object.values(ProjectStatus).includes(rawStatus as ProjectStatus)
    ? (rawStatus as ProjectStatus)
    : undefined;
  const includeArchived = rawStatus === "ALL";
  const hasFilters = Boolean(query || marketplace || rawStatus !== "ACTIVE_FLOW");
  const error = firstParam(params.error);
  const created = firstParam(params.created);
  const updated = firstParam(params.updated);
  const archived = firstParam(params.archived);
  const [projects, marketplaceFilters] = await Promise.all([
    getProjects({ query, marketplace, status, includeArchived }),
    getProjectMarketplaceFilters(),
  ]);
  const marketplaceFilterOptions = Array.from(
    new Set([
      ...marketplaceOptions.map((option) => option.value),
      ...marketplaceFilters.map((item) => item.marketplace),
    ]),
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base de organización"
        title="Proyectos"
        description="Espacios de trabajo para marcas, sellers o cuentas operativas. Cada proyecto ordena publicaciones, cambios, imports y contexto competitivo sin mezclar memorias."
      />

      <FormMessage message={error} />
      {created ? <FormMessage tone="success" message="Proyecto creado correctamente." /> : null}
      {updated ? <FormMessage tone="success" message="Proyecto actualizado correctamente." /> : null}
      {archived ? (
        <FormMessage
          tone="success"
          message="Proyecto archivado. La memoria queda conservada y sale del flujo activo."
        />
      ) : null}

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
            href="/proyectos/nuevo"
          >
            Nuevo proyecto
          </Link>
        }
        title="Listado de proyectos"
        description="Busca una cuenta, revisa su actividad conectada y entra al contexto operativo antes de tocar publicaciones o cambios."
      >
        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto_auto] lg:items-end">
          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="q">
              Buscar por nombre
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
                placeholder="Marca, seller o cuenta"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="status">
              Estado
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={rawStatus}
              id="status"
              name="status"
            >
              <option value="ACTIVE_FLOW">Activos y pausados</option>
              <option value={ProjectStatus.ACTIVE}>{projectStatusLabels.ACTIVE}</option>
              <option value={ProjectStatus.PAUSED}>{projectStatusLabels.PAUSED}</option>
              <option value={ProjectStatus.ARCHIVED}>{projectStatusLabels.ARCHIVED}</option>
              <option value="ALL">Todos</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="marketplace">
              Marketplace
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={marketplace}
              id="marketplace"
              name="marketplace"
            >
              <option value="">Todos</option>
              {marketplaceFilterOptions.map((value) => (
                <option key={value} value={value}>
                  {marketplaceLabel(value)}
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
              href="/proyectos"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {projects.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Alcance
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Actividad
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Actualizado
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {projects.map((project) => (
                    <tr key={project.id} className="transition hover:bg-panel-raised/55">
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link
                          className="inline-flex items-center gap-2 font-semibold text-ink hover:text-accent"
                          href={`/proyectos/${project.id}`}
                        >
                          <FolderOpen className="h-4 w-4 text-accent" aria-hidden="true" />
                          {project.name}
                        </Link>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                          {project.notes || "Sin contexto operativo cargado todavía."}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        <div>{marketplaceLabel(project.marketplace)}</div>
                        <p className="mt-1 text-xs text-muted">{project.currencyCode}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={projectStatusTone(project.status)}>
                          {projectStatusLabels[project.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            className="rounded-full border border-line bg-panel-raised px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                            href={`/publicaciones?projectId=${project.id}`}
                          >
                            {project._count.listings} publicaciones
                          </Link>
                          <Link
                            className="rounded-full border border-line bg-panel-raised px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                            href={`/competencia?projectId=${project.id}`}
                          >
                            {project._count.trackedSearches} búsquedas
                          </Link>
                          <Link
                            className="rounded-full border border-line bg-panel-raised px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                            href={`/importaciones?projectId=${project.id}`}
                          >
                            {project._count.csvImports} imports
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        <div>{formatRelativeDate(project.updatedAt)}</div>
                        <p className="mt-1 text-xs text-muted">{formatDate(project.updatedAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            className="rounded-2xl bg-accent px-3 py-2 font-semibold text-shell transition hover:bg-accent/90"
                            href={`/proyectos/${project.id}`}
                          >
                            Abrir
                          </Link>
                          <details className="group text-left">
                            <summary className="list-none rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
                              Más
                            </summary>
                            <div className="mt-2 min-w-44 rounded-2xl border border-line bg-shell p-2 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.95)]">
                              <Link
                                className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                href={`/publicaciones?projectId=${project.id}`}
                              >
                                Ver publicaciones
                              </Link>
                              <Link
                                className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel-raised hover:text-accent"
                                href={`/proyectos/${project.id}/editar`}
                              >
                                Editar datos
                              </Link>
                              {project.status !== ProjectStatus.ARCHIVED ? (
                                <ArchiveProjectForm
                                  projectId={project.id}
                                  projectName={project.name}
                                  variant="menu"
                                />
                              ) : null}
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-5 py-7 text-sm leading-6 text-muted">
            {hasFilters ? (
              <>
                No hay proyectos que coincidan con estos filtros. Ajusta la búsqueda o limpia los
                filtros para volver al flujo activo.
              </>
            ) : (
              <>
                Todavía no hay proyectos. Crea el primer espacio de trabajo para una marca, seller
                o cuenta operativa y después carga sus publicaciones, cambios e imports.
                <div className="mt-4">
                  <Link
                    className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell transition hover:bg-accent/90"
                    href="/proyectos/nuevo"
                  >
                    Crear primer proyecto
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
