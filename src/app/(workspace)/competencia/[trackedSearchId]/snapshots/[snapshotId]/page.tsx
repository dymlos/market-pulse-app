import Link from "next/link";
import { notFound } from "next/navigation";

import { SearchResultItemForm } from "@/components/forms/search-result-item-form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatCurrency, formatDateTime, type SearchParamsInput } from "@/lib/format";
import { createSearchResultItem } from "@/lib/market-actions";
import { getCompetitorOptions, getListingOptions, getSearchSnapshotDetail } from "@/lib/market-data";
import { searchSnapshotSourceLabels } from "@/lib/market-labels";
import { buildShelfPresence } from "@/lib/search-snapshot-comparison";

type SnapshotDetallePageProps = {
  params: Promise<{ trackedSearchId: string; snapshotId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function SnapshotDetallePage({
  params,
  searchParams,
}: SnapshotDetallePageProps) {
  const { trackedSearchId, snapshotId } = await params;
  const queryParams = (await searchParams) ?? {};
  const snapshot = await getSearchSnapshotDetail(snapshotId);

  if (!snapshot || snapshot.trackedSearchId !== trackedSearchId) {
    notFound();
  }

  const [listings, competitors] = await Promise.all([
    getListingOptions(snapshot.trackedSearch.projectId),
    getCompetitorOptions(snapshot.trackedSearch.projectId),
  ]);
  const presence = buildShelfPresence(snapshot);
  const snapshotHref = `/competencia/${trackedSearchId}/snapshots/${snapshot.id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Snapshot de busqueda"
        title={formatDateTime(snapshot.capturedAt)}
        description={`Resultados observados para "${snapshot.trackedSearch.name}". Carga manual, sin scraping.`}
      />

      <FormMessage message={firstParam(queryParams.error)} />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          action={
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/competencia/${trackedSearchId}`}
            >
              Volver
            </Link>
          }
          title="Datos del snapshot"
        >
          <dl className="grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Busqueda
              </dt>
              <dd className="mt-2 font-semibold text-ink">{snapshot.trackedSearch.query}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Fuente
              </dt>
              <dd className="mt-2 font-semibold text-ink">
                {searchSnapshotSourceLabels[snapshot.source]}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Resultados cargados
              </dt>
              <dd className="mt-2 font-semibold text-ink">{snapshot.results.length}</dd>
            </div>
          </dl>
          {snapshot.notes ? (
            <p className="mt-5 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
              {snapshot.notes}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Share of shelf simple"
          title="Presencia visible"
          description="Conteo manual de apariciones propias y ajenas dentro de los resultados cargados."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Resultados" value={presence.totalResults} />
            <Metric label="Propias" value={presence.ownCount} />
            <Metric label="Competidores" value={presence.competitorCount} />
            <Metric label="Propias top 5" value={presence.ownTop5Count} />
            <Metric label="Propias top 10" value={presence.ownTop10Count} />
            <Metric label="Sin clasificar" value={presence.unknownCount} />
          </div>

          {presence.competitorAppearances.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-panel">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Competidor / seller
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Apariciones
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Top 5
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Top 10
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                        Posiciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-panel-raised">
                    {presence.competitorAppearances.map((appearance) => (
                      <tr key={appearance.key}>
                        <td className="px-4 py-3 text-sm font-semibold text-ink">
                          {appearance.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">{appearance.count}</td>
                        <td className="px-4 py-3 text-sm text-ink">{appearance.top5Count}</td>
                        <td className="px-4 py-3 text-sm text-ink">{appearance.top10Count}</td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {appearance.positions.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Carga manual"
        title="Agregar resultado observado"
        description="Registra posiciones visibles y vincula solo cuando puedas reconocer una publicacion propia o un competidor."
      >
        <SearchResultItemForm
          action={createSearchResultItem}
          competitors={competitors}
          listings={listings}
          returnTo={snapshotHref}
          snapshotId={snapshot.id}
        />
      </SectionCard>

      <SectionCard
        eyebrow="Resultados"
        title="Resultados observados"
        description="Tabla manual de posiciones cargadas para este snapshot."
      >
        {snapshot.results.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Pos.
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Relacion
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Vendedor
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Flags
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {snapshot.results.map((result) => (
                    <tr key={result.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink">
                        {result.position}
                      </td>
                      <td className="min-w-[20rem] px-4 py-3 text-sm">
                        <div className="font-semibold text-ink">{result.observedTitle}</div>
                        {result.notes ? (
                          <p className="mt-1 text-xs leading-5 text-muted">{result.notes}</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {result.isOwnListing ? (
                          <Badge tone="success">Propia</Badge>
                        ) : result.competitor ? (
                          <Badge tone="warning">{result.competitor.name}</Badge>
                        ) : (
                          <Badge tone="muted">Observada</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatCurrency(result.observedPrice, snapshot.trackedSearch.project.currencyCode)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {result.observedSellerName ?? "Sin dato"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatFlags(result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
            Todavia no hay resultados cargados en este snapshot.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function formatFlags(result: {
  visibleFlags: string | null;
  isSponsored: boolean;
  hasFull: boolean | null;
  hasFreeShipping: boolean | null;
  isCatalogListing: boolean | null;
}) {
  const flags = [
    result.visibleFlags,
    result.isSponsored ? "sponsored" : null,
    result.hasFull ? "full" : null,
    result.hasFreeShipping ? "envio gratis" : null,
    result.isCatalogListing ? "catalogo" : null,
  ].filter(Boolean);

  return flags.length > 0 ? flags.join(", ") : "Sin flags";
}
