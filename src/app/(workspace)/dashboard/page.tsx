import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateTime } from "@/lib/format";
import { changeEventTypeLabels, listingStatusLabels, projectStatusLabels } from "@/lib/market-labels";
import { getDashboardOverview } from "@/lib/market-data";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel operativo"
        title="Dashboard con datos locales"
        description="Resumen simple del SQLite local: proyectos activos, publicaciones cargadas, cambios recientes y ultimas acciones registradas en la bitacora."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Proyectos"
          value={overview.projectCount.toString()}
          detail="Activos o pausados. Los archivados conservan memoria, pero no cuentan aca."
        />
        <MetricCard
          label="Publicaciones"
          value={overview.listingCount.toString()}
          detail="Publicaciones propias disponibles para cambios y snapshots metricos."
        />
        <MetricCard
          label="Cambios recientes"
          value={overview.recentChangeCount.toString()}
          detail="Eventos registrados en los ultimos 14 dias."
        />
        <MetricCard
          label="Busquedas"
          value={overview.trackedSearchCount.toString()}
          detail="Busquedas monitoreadas activas como contexto competitivo minimo."
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.9fr]">
        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              href="/cambios/nuevo"
            >
              Registrar cambio
            </Link>
          }
          eyebrow="Bitacora"
          title="Ultimos cambios"
          description="La app ya empieza a responder que se toco, cuando y sobre que publicacion."
        >
          {overview.recentChanges.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Cambio
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Publicacion
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Proyecto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {overview.recentChanges.map((change) => (
                      <tr key={change.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {formatDateTime(change.occurredAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <div className="flex flex-col gap-2">
                            <Badge>{changeEventTypeLabels[change.type]}</Badge>
                            <Link className="font-semibold text-ink hover:text-accent" href={`/cambios/${change.id}`}>
                              {change.detail}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <Link className="font-semibold text-ink hover:text-accent" href={`/publicaciones/${change.listingId}`}>
                            {change.listing.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {change.listing.project.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Todavia no hay cambios recientes. El primer registro ya habilita la bitacora real.
            </p>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Ultimas acciones"
          title="Datos que ya alimentan el sistema"
          description="Actividad reciente sin prometer analitica causal todavia."
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-ink">Proyectos nuevos</h3>
              <div className="mt-3 space-y-3">
                {overview.recentProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{project.name}</span>
                      <Badge>{projectStatusLabels[project.status]}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(project.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Publicaciones nuevas</h3>
              <div className="mt-3 space-y-3">
                {overview.recentListings.map((listing) => (
                  <div key={listing.id} className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link className="text-sm font-semibold text-ink hover:text-accent" href={`/publicaciones/${listing.id}`}>
                        {listing.title}
                      </Link>
                      <Badge>{listingStatusLabels[listing.status]}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{listing.project.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
