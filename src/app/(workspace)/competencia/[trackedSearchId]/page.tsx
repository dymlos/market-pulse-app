import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateTime } from "@/lib/format";
import { searchSnapshotSourceLabels } from "@/lib/market-labels";
import { getTrackedSearchDetail } from "@/lib/market-data";

type BusquedaDetallePageProps = {
  params: Promise<{ trackedSearchId: string }>;
};

export default async function BusquedaDetallePage({ params }: BusquedaDetallePageProps) {
  const { trackedSearchId } = await params;
  const trackedSearch = await getTrackedSearchDetail(trackedSearchId);

  if (!trackedSearch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Busqueda monitoreada"
        title={trackedSearch.name}
        description="Contexto competitivo minimo para mirar despues junto a cambios propios. Sin scraping ni analisis profundo."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href="/competencia"
            >
              Volver
            </Link>
          }
          title="Datos de la busqueda"
        >
          <dl className="grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Proyecto
              </dt>
              <dd className="mt-2 font-semibold text-ink">{trackedSearch.project.name}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Query
              </dt>
              <dd className="mt-2 font-semibold text-ink">{trackedSearch.query}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Estado
              </dt>
              <dd className="mt-2">
                <Badge tone={trackedSearch.isActive ? "success" : "muted"}>
                  {trackedSearch.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </dd>
            </div>
          </dl>
          {trackedSearch.notes ? (
            <p className="mt-5 rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              {trackedSearch.notes}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Snapshots"
          title="SearchSnapshot"
          description="Lista de snapshots guardados para esta busqueda. La carga de nuevos snapshots queda para el bloque de importacion/manual posterior."
        >
          {trackedSearch.snapshots.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Capturado
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Fuente
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Resultados
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Nota
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {trackedSearch.snapshots.map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {formatDateTime(snapshot.capturedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {searchSnapshotSourceLabels[snapshot.source]}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {snapshot.resultsCount ?? snapshot._count.results}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {snapshot.notes ?? "Sin nota"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Todavia no hay snapshots para esta busqueda.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
