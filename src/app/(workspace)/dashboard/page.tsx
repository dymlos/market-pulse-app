import Link from "next/link";
import { ClipboardList, FolderOpen, Package, Search } from "lucide-react";

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
          href="/proyectos"
          icon={FolderOpen}
        />
        <MetricCard
          label="Publicaciones"
          value={overview.listingCount.toString()}
          detail="Publicaciones propias disponibles para cambios y snapshots metricos."
          href="/publicaciones"
          icon={Package}
        />
        <MetricCard
          label="Cambios recientes"
          value={overview.recentChangeCount.toString()}
          detail="Eventos registrados en los ultimos 14 dias."
          href="/cambios"
          icon={ClipboardList}
        />
        <MetricCard
          label="Busquedas"
          value={overview.trackedSearchCount.toString()}
          detail="Busquedas monitoreadas activas como contexto competitivo minimo."
          href="/competencia"
          icon={Search}
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.9fr]">
        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
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
                        Proyecto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-panel">
                    {overview.recentChanges.map((change) => (
                      <tr key={change.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {formatDateTime(change.occurredAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <div className="flex flex-col gap-2">
                            <Badge>{changeEventTypeLabels[change.type]}</Badge>
                            <Link className="font-semibold text-ink hover:text-accent" href={`/cambios/${change.id}`}>
                              {change.detail}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <Link className="font-semibold text-ink hover:text-accent" href={`/publicaciones/${change.listingId}`}>
                            {change.listing.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          {change.listing.project.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
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
                  <div key={project.id} className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{project.name}</span>
                      <Badge>{projectStatusLabels[project.status]}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted">{formatDateTime(project.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Publicaciones nuevas</h3>
              <div className="mt-3 space-y-3">
                {overview.recentListings.map((listing) => (
                  <div key={listing.id} className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link className="text-sm font-semibold text-ink hover:text-accent" href={`/publicaciones/${listing.id}`}>
                        {listing.title}
                      </Link>
                      <Badge>{listingStatusLabels[listing.status]}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted">{listing.project.name}</p>
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
