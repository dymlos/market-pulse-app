import Link from "next/link";

import { ChangeEventType } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatDateTime, type SearchParamsInput } from "@/lib/format";
import { changeEventTypeLabels, changeEventTypeOptions } from "@/lib/market-labels";
import { getChangeEvents, getListingOptions, getProjectOptions } from "@/lib/market-data";

type CambiosPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

function parseChangeEventType(value?: string) {
  return value && changeEventTypeOptions.includes(value as ChangeEventType)
    ? (value as ChangeEventType)
    : undefined;
}

export default async function CambiosPage({ searchParams }: CambiosPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const selectedListingId = firstParam(params.listingId) || "";
  const selectedType = parseChangeEventType(firstParam(params.type));
  const error = firstParam(params.error);

  const [projects, listings, changes] = await Promise.all([
    getProjectOptions(),
    getListingOptions(selectedProjectId || undefined),
    getChangeEvents({
      projectId: selectedProjectId || undefined,
      listingId: selectedListingId || undefined,
      type: selectedType,
    }),
  ]);

  const createHref = selectedListingId ? `/cambios/nuevo?listingId=${selectedListingId}` : "/cambios/nuevo";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bitacora operativa"
        title="Cambios"
        description="Registro de acciones propias sobre publicaciones. Esta es la memoria minima para despues mirar impacto probable."
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
        title="Listado de cambios"
        description="Filtra por proyecto, publicacion o tipo para reconstruir rapido que se toco."
      >
        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 lg:grid-cols-[1fr_1fr_0.8fr_auto_auto] lg:items-end">
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

          <button
            className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            type="submit"
          >
            Filtrar
          </button>
          {(selectedProjectId || selectedListingId || selectedType) ? (
            <Link
              className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
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
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Publicacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Detalle
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {changes.map((change) => (
                    <tr key={change.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatDateTime(change.occurredAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge>{changeEventTypeLabels[change.type]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/publicaciones/${change.listingId}`}>
                          {change.listing.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted">{change.listing.project.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/cambios/${change.id}`}>
                          {change.detail}
                        </Link>
                        {change.comment ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                            {change.comment}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/cambios/${change.id}`}
                          >
                            Detalle
                          </Link>
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/cambios/${change.id}/editar`}
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-6 text-sm leading-6 text-muted">
            No hay cambios para este filtro. Registra el primer evento para empezar la bitacora.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
