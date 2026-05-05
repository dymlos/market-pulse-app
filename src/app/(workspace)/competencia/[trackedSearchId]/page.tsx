import Link from "next/link";
import { notFound } from "next/navigation";

import { SearchSnapshotComparisonPanel } from "@/components/competition/search-snapshot-comparison-panel";
import { SearchSnapshotForm } from "@/components/forms/search-snapshot-form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  firstParam,
  formatDateTime,
  toDateTimeInputValue,
  type SearchParamsInput,
} from "@/lib/format";
import { createSearchSnapshot } from "@/lib/market-actions";
import { getTrackedSearchComparison, getTrackedSearchDetail } from "@/lib/market-data";
import { searchSnapshotSourceLabels } from "@/lib/market-labels";

type BusquedaDetallePageProps = {
  params: Promise<{ trackedSearchId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function BusquedaDetallePage({
  params,
  searchParams,
}: BusquedaDetallePageProps) {
  const { trackedSearchId } = await params;
  const queryParams = (await searchParams) ?? {};
  const beforeSnapshotId = firstParam(queryParams.beforeSnapshotId);
  const afterSnapshotId = firstParam(queryParams.afterSnapshotId);

  const [trackedSearch, comparisonData] = await Promise.all([
    getTrackedSearchDetail(trackedSearchId),
    getTrackedSearchComparison(trackedSearchId, beforeSnapshotId, afterSnapshotId),
  ]);

  if (!trackedSearch) {
    notFound();
  }

  const detailHref = `/competencia/${trackedSearch.id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Busqueda monitoreada"
        title={trackedSearch.name}
        description="Contexto competitivo minimo para mirar despues junto a cambios propios. Sin scraping ni analisis profundo."
      />

      <FormMessage message={firstParam(queryParams.error)} />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href="/competencia"
              >
                Volver
              </Link>
              <Link
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href={`/competencia/${trackedSearch.id}/editar`}
              >
                Editar
              </Link>
            </div>
          }
          title="Datos de la busqueda"
        >
          <dl className="grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Proyecto
              </dt>
              <dd className="mt-2 font-semibold text-ink">{trackedSearch.project.name}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Query
              </dt>
              <dd className="mt-2 font-semibold text-ink">{trackedSearch.query}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
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
            <p className="mt-5 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
              {trackedSearch.notes}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Nuevo snapshot"
          title="Crear snapshot manual"
          description="Carga la fecha y despues agrega los resultados observados uno por uno."
        >
          <SearchSnapshotForm
            action={createSearchSnapshot}
            defaultCapturedAt={toDateTimeInputValue(new Date())}
            returnTo={detailHref}
            trackedSearchId={trackedSearch.id}
          />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Snapshots"
        title="Snapshots de busqueda"
        description="Cada snapshot guarda resultados observados manualmente para comparar presencia propia y competidores en el tiempo."
      >
        {trackedSearch.snapshots.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Capturado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Fuente
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Resultados
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Nota
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {trackedSearch.snapshots.map((snapshot) => (
                    <tr key={snapshot.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatDateTime(snapshot.capturedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {searchSnapshotSourceLabels[snapshot.source]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {snapshot.resultsCount ?? snapshot._count.results}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {snapshot.notes ?? "Sin nota"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <Link
                          className="rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent"
                          href={`/competencia/${trackedSearch.id}/snapshots/${snapshot.id}`}
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
            Todavia no hay snapshots para esta busqueda.
          </p>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Comparacion"
        title="Comparar snapshots"
        description="Lectura simple de presencia propia, competidores que entran o salen y cambios de precio observados."
      >
        {comparisonData.snapshots.length >= 2 ? (
          <div className="space-y-5">
            <form className="grid gap-4 rounded-2xl border border-line bg-panel-raised p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="beforeSnapshotId">
                  Snapshot base
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  defaultValue={comparisonData.beforeSnapshot?.id}
                  id="beforeSnapshotId"
                  name="beforeSnapshotId"
                >
                  {comparisonData.snapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {formatDateTime(snapshot.capturedAt)} - {snapshot.results.length} resultados
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="afterSnapshotId">
                  Snapshot comparado
                </label>
                <select
                  className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  defaultValue={comparisonData.afterSnapshot?.id}
                  id="afterSnapshotId"
                  name="afterSnapshotId"
                >
                  {comparisonData.snapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {formatDateTime(snapshot.capturedAt)} - {snapshot.results.length} resultados
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                type="submit"
              >
                Comparar
              </button>
            </form>

            {comparisonData.comparison && comparisonData.beforeSnapshot && comparisonData.afterSnapshot ? (
              <SearchSnapshotComparisonPanel
                afterLabel={formatDateTime(comparisonData.afterSnapshot.capturedAt)}
                beforeLabel={formatDateTime(comparisonData.beforeSnapshot.capturedAt)}
                comparison={comparisonData.comparison}
                currencyCode={trackedSearch.project.currencyCode}
              />
            ) : (
              <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
                Selecciona dos snapshots distintos para comparar.
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
            Hace falta cargar al menos dos snapshots de esta busqueda para compararlos.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
