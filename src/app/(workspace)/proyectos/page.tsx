import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { archiveProject } from "@/lib/market-actions";
import { firstParam, formatDate, type SearchParamsInput } from "@/lib/format";
import { projectStatusLabels, projectStatusTone } from "@/lib/market-labels";
import { getProjects } from "@/lib/market-data";

type ProyectosPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function ProyectosPage({ searchParams }: ProyectosPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base de organizacion"
        title="Proyectos"
        description="Agrupa sellers, marcas o cuentas de trabajo. Cada proyecto conecta publicaciones, cambios, imports y contexto competitivo minimo."
      />

      <FormMessage message={error} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            href="/proyectos/nuevo"
          >
            Nuevo proyecto
          </Link>
        }
        title="Listado de proyectos"
        description="Tabla simple con estado, cantidad de publicaciones asociadas y acceso rapido a edicion."
      >
        {projects.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Marketplace
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Publicaciones
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Actualizado
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-semibold text-ink">{project.name}</div>
                        {project.notes ? (
                          <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-slate-500">
                            {project.notes}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {project.marketplace}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={projectStatusTone(project.status)}>
                          {projectStatusLabels[project.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {project._count.listings}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/publicaciones?projectId=${project.id}`}
                          >
                            Ver publicaciones
                          </Link>
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/proyectos/${project.id}/editar`}
                          >
                            Editar
                          </Link>
                          {project.status !== "ARCHIVED" ? (
                            <form action={archiveProject}>
                              <input name="projectId" type="hidden" value={project.id} />
                              <button
                                className="rounded-2xl border border-line px-3 py-2 font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-700"
                                type="submit"
                              >
                                Archivar
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            Todavia no hay proyectos. Crea uno para empezar a cargar publicaciones y cambios.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
