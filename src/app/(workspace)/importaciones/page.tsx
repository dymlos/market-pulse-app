import Link from "next/link";
import { ArrowRight, CalendarClock, FileText, History, ListFilter, Search } from "lucide-react";

import { CsvMetricImportPanel } from "@/components/imports/csv-metric-import-panel";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { CsvImportStatus } from "@/generated/prisma";
import {
  firstParam,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  type SearchParamsInput,
} from "@/lib/format";
import { getCsvImports, getProjectOptions, type CsvImportTimeFilter } from "@/lib/market-data";
import {
  csvImportStatusLabels,
  csvImportStatusTone,
  csvImportTypeLabels,
} from "@/lib/market-labels";

type ImportacionesPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

type StoredImportSummary = {
  message?: string;
  counts?: {
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    skippedRows?: number;
    createdListings?: number;
  };
  metadata?: {
    snapshotDateRange?: {
      from: string;
      to: string;
    };
    affectedListings?: Array<{
      id: string;
      title: string;
      reference: string;
    }>;
  };
  issues?: Array<{
    rowNumber?: number;
    type: string;
    message: string;
    listingReference?: string;
  }>;
};

const importStatusOptions = Object.values(CsvImportStatus);
const timeframeOptions: Array<{ value: CsvImportTimeFilter; label: string }> = [
  { value: "LAST_7_DAYS", label: "Ultimos 7 dias" },
  { value: "LAST_30_DAYS", label: "Ultimos 30 dias" },
];

function parseImportStatus(value?: string) {
  return value && importStatusOptions.includes(value as CsvImportStatus)
    ? (value as CsvImportStatus)
    : undefined;
}

function parseTimeframe(value?: string) {
  return timeframeOptions.some((option) => option.value === value)
    ? (value as CsvImportTimeFilter)
    : undefined;
}

function parseImportSummary(summary: string | null): StoredImportSummary {
  if (!summary) {
    return {};
  }

  try {
    const parsed = JSON.parse(summary) as StoredImportSummary;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function formatStoredDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatDate(date);
}

function formatStoredDateRange(range?: { from: string; to: string }) {
  if (!range) {
    return "Rango no registrado";
  }

  const from = formatStoredDate(range.from);
  const to = formatStoredDate(range.to);
  return from === to ? from : `${from} a ${to}`;
}

function getSkippedRows(csvImport: { totalRows: number | null; validRows: number | null; invalidRows: number | null }, summary: StoredImportSummary) {
  if (summary.counts?.skippedRows !== undefined) {
    return summary.counts.skippedRows;
  }

  const totalRows = csvImport.totalRows ?? 0;
  const validRows = csvImport.validRows ?? 0;
  const invalidRows = csvImport.invalidRows ?? 0;
  return Math.max(0, totalRows - validRows - invalidRows);
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default async function ImportacionesPage({ searchParams }: ImportacionesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const query = firstParam(params.q)?.trim() ?? "";
  const rawStatus = firstParam(params.status) ?? "";
  const status = parseImportStatus(rawStatus);
  const rawTimeframe = firstParam(params.timeframe) ?? "";
  const timeframe = parseTimeframe(rawTimeframe);
  const hasFilters = Boolean(selectedProjectId || query || status || timeframe);
  const [projects, recentImports] = await Promise.all([
    getProjectOptions(),
    getCsvImports({
      projectId: selectedProjectId || undefined,
      query,
      status,
      timeframe,
    }),
  ]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const importsWithSummary = recentImports.map((csvImport) => ({
    csvImport,
    summary: parseImportSummary(csvImport.summary),
  }));
  const totalAcceptedRows = importsWithSummary.reduce(
    (total, item) => total + (item.csvImport.validRows ?? 0),
    0,
  );
  const importsWithIssues = importsWithSummary.filter((item) => {
    const skippedRows = getSkippedRows(item.csvImport, item.summary);
    return item.csvImport.status !== CsvImportStatus.PROCESSED || skippedRows > 0;
  }).length;
  const latestImport = importsWithSummary[0]?.csvImport;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entrada de evidencia"
        title="Carga de datos"
        description="Importa CSV locales para convertir historicos de publicaciones en snapshots metricos. Esta seccion alimenta Publicaciones, Cambios, timeline causal e insights."
      />

      <SectionCard
        title="Importar metricas desde CSV"
        description="Subi un archivo, revisa la previsualizacion, ajusta columnas y guarda snapshots comparables por publicacion. No consulta APIs externas ni hace scraping."
      >
        <CsvMetricImportPanel projects={projects} selectedProjectId={selectedProjectId} />
      </SectionCard>

      <SectionCard
        title="Historial de cargas"
        description={
          selectedProject
            ? `Auditoria local filtrada por ${selectedProject.name}.`
            : "Registro operativo de cargas completas, parciales o fallidas. Sirve para saber que evidencia entro y que quedo pendiente."
        }
      >
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-panel-raised p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <History className="h-4 w-4 text-accent" aria-hidden="true" />
              Ultima carga
            </div>
            <div className="mt-2 text-lg font-semibold text-ink">
              {latestImport ? formatRelativeDate(latestImport.importedAt) : "Sin cargas"}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              {latestImport ? formatDateTime(latestImport.importedAt) : "Todavia no hay historial local."}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel-raised p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              Snapshots aceptados
            </div>
            <div className="mt-2 text-lg font-semibold text-ink">{totalAcceptedRows}</div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Filas guardadas en el historial filtrado.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel-raised p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
              Cargas con revision
            </div>
            <div className="mt-2 text-lg font-semibold text-ink">{importsWithIssues}</div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Parciales, fallidas o con filas omitidas para revisar.
            </p>
          </div>
        </div>

        <form className="mb-5 grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 xl:grid-cols-[1.1fr_0.9fr_0.7fr_0.7fr_auto_auto] xl:items-end">
          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="q">
              Buscar archivo o proyecto
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
                placeholder="metric-snapshots.csv"
              />
            </div>
          </div>

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
            <label className="text-sm font-semibold text-ink" htmlFor="status">
              Resultado
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={rawStatus}
              id="status"
              name="status"
            >
              <option value="">Todos</option>
              {importStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {csvImportStatusLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink" htmlFor="timeframe">
              Periodo
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={rawTimeframe}
              id="timeframe"
              name="timeframe"
            >
              <option value="">Todo</option>
              {timeframeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              href="/importaciones"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {importsWithSummary.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Archivo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Evidencia cargada
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Revision
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {importsWithSummary.map(({ csvImport, summary }) => {
                    const skippedRows = getSkippedRows(csvImport, summary);
                    const affectedListings = summary.metadata?.affectedListings ?? [];
                    const issues = summary.issues ?? [];

                    return (
                      <tr key={csvImport.id} className="transition hover:bg-panel-raised/55">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          <div>{formatRelativeDate(csvImport.importedAt)}</div>
                          <p className="mt-1 text-xs text-muted">
                            {formatDateTime(csvImport.importedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <div className="font-semibold">{csvImport.fileName}</div>
                          <p className="mt-1 text-xs text-muted">
                            {csvImportTypeLabels[csvImport.type]}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {csvImport.project.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <Badge tone={csvImportStatusTone(csvImport.status)}>
                            {csvImportStatusLabels[csvImport.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <div>{countLabel(csvImport.validRows ?? 0, "snapshot", "snapshots")}</div>
                          <p className="mt-1 text-xs leading-5 text-muted">
                            {formatStoredDateRange(summary.metadata?.snapshotDateRange)}
                          </p>
                          {affectedListings.length > 0 ? (
                            <p className="mt-1 text-xs text-muted">
                              {countLabel(affectedListings.length, "publicacion afectada", "publicaciones afectadas")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <div>
                            {(csvImport.invalidRows ?? 0) + skippedRows === 0
                              ? "Sin observaciones"
                              : `${csvImport.invalidRows ?? 0} invalidas / ${skippedRows} omitidas`}
                          </div>
                          {summary.counts?.createdListings ? (
                            <p className="mt-1 text-xs text-muted">
                              {countLabel(summary.counts.createdListings, "publicacion creada", "publicaciones creadas")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-3 py-2 font-semibold text-shell transition hover:bg-accent/90"
                              href={`/publicaciones?projectId=${csvImport.projectId}&trackingState=WITH_SNAPSHOTS`}
                            >
                              Ver publicaciones
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <details className="group text-left">
                              <summary className="list-none rounded-2xl border border-line px-3 py-2 font-semibold text-ink transition hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
                                Detalle
                              </summary>
                              <div className="mt-2 w-80 rounded-2xl border border-line bg-shell p-3 text-left shadow-[0_18px_45px_-28px_rgba(0,0,0,0.95)]">
                                <div className="text-sm font-semibold text-ink">
                                  Que dejo esta carga
                                </div>
                                <p className="mt-1 text-xs leading-5 text-muted">
                                  {summary.message || "Carga registrada sin resumen extendido."}
                                </p>
                                {issues.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    {issues.slice(0, 4).map((issue, index) => (
                                      <div
                                        className="rounded-xl border border-line bg-panel px-3 py-2 text-xs leading-5 text-muted"
                                        key={`${issue.type}-${issue.rowNumber ?? index}`}
                                      >
                                        <span className="font-semibold text-ink">
                                          {issue.rowNumber ? `Fila ${issue.rowNumber}: ` : ""}
                                        </span>
                                        {issue.message}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-3 text-xs text-muted">
                                    No hay errores guardados para esta carga.
                                  </p>
                                )}
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-5 py-7 text-sm leading-6 text-muted">
            {hasFilters ? (
              <>
                No hay cargas que coincidan con estos filtros. Ajusta la busqueda o limpia filtros
                para volver al historial completo.
              </>
            ) : (
              <>
                Todavia no hay cargas registradas. Empeza con un CSV de metricas para que
                Publicaciones y Cambios tengan evidencia antes/despues. El archivo de prueba local
                recomendado es <span className="font-mono text-ink">samples/csv/metric-snapshots.sample.csv</span>.
              </>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
