import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatCurrency, type SearchParamsInput } from "@/lib/format";
import { listingStatusLabels, listingStatusTone } from "@/lib/market-labels";
import { getListings, getProjectOptions } from "@/lib/market-data";

type PublicacionesPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function PublicacionesPage({ searchParams }: PublicacionesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const error = firstParam(params.error);

  const [projects, listings] = await Promise.all([
    getProjectOptions(),
    getListings({ projectId: selectedProjectId || undefined }),
  ]);

  const createHref = selectedProjectId
    ? `/publicaciones/nueva?projectId=${selectedProjectId}`
    : "/publicaciones/nueva";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base del nucleo causal"
        title="Publicaciones"
        description="Listado de publicaciones propias conectado a proyectos, cambios y snapshots metricos. Sin graficos complejos todavia."
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
        title="Listado de publicaciones"
        description="Filtra por proyecto para trabajar una cuenta o marca sin perder contexto."
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
                      Precio
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Datos
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-4 py-3 text-sm text-ink">
                        <Link className="font-semibold text-ink hover:text-accent" href={`/publicaciones/${listing.id}`}>
                          {listing.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted">
                          {listing.sku || listing.externalId || "Sin SKU/ID externo"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {listing.project.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={listingStatusTone(listing.status)}>
                          {listingStatusLabels[listing.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatCurrency(listing.currentPrice, listing.project.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {listing.availableStock ?? "Sin dato"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {listing._count.changeEvents} cambios / {listing._count.metricSnapshots} snapshots
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/publicaciones/${listing.id}`}
                          >
                            Detalle
                          </Link>
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                            href={`/publicaciones/${listing.id}/editar`}
                          >
                            Editar
                          </Link>
                          <Link
                            className="rounded-2xl border border-line px-3 py-2 font-semibold text-muted transition hover:border-accent hover:text-accent"
                            href={`/cambios/nuevo?listingId=${listing.id}`}
                          >
                            Cambio
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
            No hay publicaciones para este filtro. Carga una publicacion para empezar a registrar cambios.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
