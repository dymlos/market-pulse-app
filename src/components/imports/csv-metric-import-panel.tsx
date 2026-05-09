"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileSearch, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import {
  metricImportFields,
  type MetricImportField,
  type MetricImportMapping,
} from "@/lib/csv/metric-mapping";

type ProjectOption = {
  id: string;
  name: string;
};

type ListingOption = {
  id: string;
  externalId: string | null;
  sku: string | null;
  title: string;
};

type PreviewResponse = {
  headers: string[];
  totalRows: number;
  delimiter: string;
  previewRows: Array<{
    rowNumber: number;
    cells: string[];
  }>;
  suggestedMapping: MetricImportMapping;
  parseErrors: Array<{
    rowNumber?: number;
    message: string;
  }>;
  validationSummary: {
    validRows: number;
    invalidRows: number;
    skippedRows: number;
    mappingErrors: string[];
  };
  unresolvedListingReferences: string[];
  listings: ListingOption[];
};

type ImportIssue = {
  rowNumber?: number;
  type: string;
  message: string;
  listingReference?: string;
};

type ImportResult = {
  importId?: string;
  status: string;
  counts: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    skippedRows: number;
    createdListings: number;
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
  issues: ImportIssue[];
};

type CsvMetricImportPanelProps = {
  projects: ProjectOption[];
  selectedProjectId?: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:bg-panel disabled:text-muted";
const labelClass = "text-sm font-semibold text-ink";
const helpClass = "mt-1 text-xs leading-5 text-muted";
const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:text-muted";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-muted";

const importSteps = [
  "Elegir proyecto",
  "Subir CSV",
  "Previsualizar",
  "Resolver columnas",
  "Importar y revisar",
];

const metricFieldHelp: Partial<Record<MetricImportField, string>> = {
  date: "Fecha del snapshot. Acepta ISO o dd/mm/yyyy.",
  listingId: "ID interno de Market Pulse, si ya lo tenes.",
  listingExternalId: "ID externo del marketplace, por ejemplo MLA...",
  listingSku: "SKU o codigo interno de la publicacion.",
  listingTitle: "Titulo reconocible de la publicacion.",
  listingKey: "Referencia generica cuando el CSV no separa SKU o ID.",
  visits: "Visitas o sesiones observadas en esa fecha.",
  sales: "Unidades vendidas en el periodo exportado.",
  conversion: "Puede venir como porcentaje o ratio.",
  revenue: "Facturacion o GMV del periodo.",
  stock: "Stock disponible observado.",
  price: "Precio publicado observado.",
  adSpend: "Inversion en Ads, si el CSV la trae.",
  notes: "Notas operativas que quieras conservar con el snapshot.",
};

const issueTypeLabels: Record<string, string> = {
  parse: "Lectura del archivo",
  invalid: "Fila invalida",
  skipped: "Publicacion no resuelta",
  mapping: "Columnas",
};

const resultStatusLabels: Record<string, string> = {
  PROCESSED: "Carga completada",
  PARTIAL: "Carga parcial",
  FAILED: "Carga fallida",
  PENDING: "Carga pendiente",
};

function formatListingOption(listing: ListingOption) {
  const reference = listing.sku || listing.externalId || listing.id;
  return `${listing.title} (${reference})`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateRange(range?: { from: string; to: string }) {
  if (!range) {
    return "Sin rango detectado";
  }

  const from = formatDate(range.from);
  const to = formatDate(range.to);
  return from === to ? from : `${from} a ${to}`;
}

function issueAction(issue: ImportIssue) {
  if (issue.type === "mapping") {
    return "Mapea fecha, una referencia de publicacion y al menos una metrica.";
  }

  if (issue.type === "skipped") {
    return "Vincula la referencia manualmente o activa la creacion de publicaciones minimas.";
  }

  if (issue.type === "parse") {
    return "Revisa separador, comillas y encabezados del CSV.";
  }

  return "Corrige la fila en el CSV y vuelve a previsualizar.";
}

function countText(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function CsvMetricImportPanel({ projects, selectedProjectId }: CsvMetricImportPanelProps) {
  const defaultProjectId = selectedProjectId || projects[0]?.id || "";
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<MetricImportMapping>({});
  const [manualResolutions, setManualResolutions] = useState<Record<string, string>>({});
  const [createMissingListings, setCreateMissingListings] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  async function requestPreview() {
    if (!file || !projectId) {
      setError("Selecciona un proyecto y un archivo CSV para previsualizar.");
      return;
    }

    setIsPreviewing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("file", file);

      const response = await fetch("/api/importaciones/metricas/preview", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok || !payload.preview) {
        setError(payload.error ?? "No se pudo previsualizar el CSV.");
        return;
      }

      setPreview(payload.preview);
      setMapping(payload.preview.suggestedMapping ?? {});
      setManualResolutions({});
    } catch {
      setError("No se pudo conectar con el importador local.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function requestImport() {
    if (!file || !projectId || !preview) {
      setError("Previsualiza el CSV antes de importar snapshots.");
      return;
    }

    setIsImporting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(mapping));
      formData.append("manualResolutions", JSON.stringify(manualResolutions));
      formData.append("createMissingListings", createMissingListings ? "true" : "false");

      const response = await fetch("/api/importaciones/metricas", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.result) {
        setError(payload.error ?? "No se pudo importar el CSV.");
        return;
      }

      setResult(payload.result);
    } catch {
      setError("No se pudo conectar con el importador local.");
    } finally {
      setIsImporting(false);
    }
  }

  function resetFlow() {
    setFile(null);
    setPreview(null);
    setMapping({});
    setManualResolutions({});
    setCreateMissingListings(false);
    setResult(null);
    setError("");
    setFileInputKey((current) => current + 1);
  }

  function updateMapping(field: MetricImportField, header: string) {
    setMapping((current) => ({
      ...current,
      [field]: header || undefined,
    }));
  }

  function updateManualResolution(reference: string, listingId: string) {
    setManualResolutions((current) => ({
      ...current,
      [reference]: listingId,
    }));
  }

  const affectedListings = result?.metadata?.affectedListings ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-5">
        {importSteps.map((step, index) => (
          <div
            className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink"
            key={step}
          >
            <div className="font-mono text-xs font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="mt-1 font-semibold">{step}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-panel-raised p-4 text-sm leading-6 text-muted">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">Formato recomendado</h3>
            <p className="mt-1 max-w-3xl">
              El CSV debe traer una fecha, una referencia de publicacion y al menos una metrica. La
              referencia puede ser SKU, ID externo, titulo o una clave generica reconocible.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-panel px-3 py-2 font-mono text-xs text-ink">
            samples/csv/metric-snapshots.sample.csv
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["fecha", "sku / id externo", "visitas", "ventas", "conversion", "precio", "stock"].map(
            (field) => (
              <span
                className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-muted"
                key={field}
              >
                {field}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label className={labelClass} htmlFor="projectId">
            Proyecto
          </label>
          <select
            className={inputClass}
            disabled={projects.length === 0}
            id="projectId"
            onChange={(event) => {
              setProjectId(event.target.value);
              resetFlow();
            }}
            value={projectId}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <p className={helpClass}>Los snapshots importados se guardan dentro de este proyecto.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="csvFile">
            Archivo CSV
          </label>
          <input
            accept=".csv,text/csv"
            className={inputClass}
            id="csvFile"
            key={fileInputKey}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setPreview(null);
              setResult(null);
            }}
            type="file"
          />
          <p className={helpClass}>Previsualiza antes de guardar para detectar columnas y errores.</p>
        </div>

        <button
          className={secondaryButtonClass}
          disabled={!file || !projectId || isPreviewing}
          onClick={requestPreview}
          type="button"
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          {isPreviewing ? "Previsualizando..." : "Previsualizar"}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-line bg-panel-raised px-4 py-4 text-sm text-muted">
          Primero crea un proyecto activo para importar metricas.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold">No se pudo avanzar con la carga</div>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Filas leidas
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">{preview.totalRows}</div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Listas para guardar
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.validRows}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Con errores
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.invalidRows}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Sin publicacion
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.skippedRows}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-ink">Columnas detectadas</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              Ajusta el mapeo si el CSV usa nombres propios. Para importar hace falta fecha, una
              referencia de publicacion y al menos una metrica o nota.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricImportFields.map((field) => (
                <div key={field.key}>
                  <label className={labelClass} htmlFor={`mapping-${field.key}`}>
                    {field.label}
                    {field.required ? (
                      <span className="ml-2 text-xs font-semibold text-accent">obligatorio</span>
                    ) : null}
                  </label>
                  <select
                    className={inputClass}
                    id={`mapping-${field.key}`}
                    onChange={(event) => updateMapping(field.key, event.target.value)}
                    value={mapping[field.key] ?? ""}
                  >
                    <option value="">Sin mapear</option>
                    {preview.headers.map((header) => (
                      <option key={`${field.key}-${header}`} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  {metricFieldHelp[field.key] ? (
                    <p className={helpClass}>{metricFieldHelp[field.key]}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel-raised p-4">
            <label className="flex items-start gap-3 text-sm font-semibold text-ink">
              <input
                checked={createMissingListings}
                className="mt-1"
                onChange={(event) => setCreateMissingListings(event.target.checked)}
                type="checkbox"
              />
              <span>
                Crear publicaciones minimas cuando una fila no encuentre una coincidencia
                <span className="mt-1 block text-xs font-normal leading-5 text-muted">
                  Usalo para backfills donde el CSV trae SKU o titulo confiable. La publicacion se
                  crea solo con datos basicos y despues puede completarse desde Publicaciones.
                </span>
              </span>
            </label>
          </div>

          {preview.unresolvedListingReferences.length > 0 ? (
            <div>
              <h3 className="text-base font-semibold text-ink">Referencias sin coincidencia</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Si reconoces a que publicacion pertenece cada referencia, vinculala manualmente.
                Si no, podes dejarla sin resolver y la fila quedara omitida.
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-line">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-panel-raised">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Referencia CSV
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Publicacion existente
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-panel">
                    {preview.unresolvedListingReferences.map((reference) => (
                      <tr key={reference}>
                        <td className="px-4 py-3 text-sm text-ink">{reference}</td>
                        <td className="px-4 py-3 text-sm">
                          <select
                            className="w-full rounded-2xl border border-line bg-panel-raised px-3 py-2 text-sm text-ink"
                            onChange={(event) =>
                              updateManualResolution(reference, event.target.value)
                            }
                            value={manualResolutions[reference] ?? ""}
                          >
                            <option value="">Sin resolver</option>
                            {preview.listings.map((listing) => (
                              <option key={`${reference}-${listing.id}`} value={listing.id}>
                                {formatListingOption(listing)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="border-b border-line bg-panel-raised px-4 py-3">
              <h3 className="text-base font-semibold text-ink">Preview del archivo</h3>
              <p className="mt-1 text-sm text-muted">
                Primeras filas detectadas antes de guardar snapshots.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Fila
                    </th>
                    {preview.headers.map((header) => (
                      <th
                        className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
                        key={header}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {preview.previewRows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">
                        {row.rowNumber}
                      </td>
                      {row.cells.map((cell, index) => (
                        <td
                          className="whitespace-nowrap px-4 py-3 text-sm text-ink"
                          key={`${row.rowNumber}-${preview.headers[index]}`}
                        >
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {preview.parseErrors.length > 0 || preview.validationSummary.mappingErrors.length > 0 ? (
            <div className="rounded-2xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm text-warning">
              <div className="font-semibold">Hay observaciones antes de importar</div>
              <p className="mt-1 leading-6">
                {[...preview.validationSummary.mappingErrors, ...preview.parseErrors.map((item) => item.message)]
                  .slice(0, 6)
                  .join(" ")}
              </p>
            </div>
          ) : null}

          <button
            className={primaryButtonClass}
            disabled={isImporting || !selectedProject}
            onClick={requestImport}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isImporting ? "Importando..." : "Importar snapshots"}
          </button>
        </div>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {resultStatusLabels[result.status] ?? `Resultado: ${result.status}`}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                La carga quedo registrada en el historial local. Revisa las publicaciones afectadas
                para ver los snapshots en el resumen de metricas y el timeline causal.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-panel-raised px-3 py-2 text-sm font-semibold text-ink">
              {formatDateRange(result.metadata?.snapshotDateRange)}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Filas
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">{result.counts.totalRows}</div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Guardadas
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">{result.counts.validRows}</div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Observadas
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">
                {result.counts.invalidRows + result.counts.skippedRows}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Publicaciones
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">{affectedListings.length}</div>
            </div>
            <div className="rounded-2xl border border-line bg-panel-raised p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Creadas
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">
                {result.counts.createdListings}
              </div>
            </div>
          </div>

          {affectedListings.length > 0 ? (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-ink">Publicaciones afectadas</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {affectedListings.slice(0, 8).map((listing) => (
                  <Link
                    className="rounded-full border border-line bg-panel-raised px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                    href={`/publicaciones/${listing.id}`}
                    key={listing.id}
                  >
                    {listing.title}
                  </Link>
                ))}
                {affectedListings.length > 8 ? (
                  <span className="rounded-full border border-line bg-panel-raised px-3 py-1.5 text-xs font-semibold text-muted">
                    +{affectedListings.length - 8} mas
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {result.issues.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <div className="border-b border-line bg-panel-raised px-4 py-3">
                <h4 className="text-sm font-semibold text-ink">Filas que requieren revision</h4>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Se muestran hasta 12 observaciones para que puedas corregir el CSV y reintentar.
                </p>
              </div>
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Fila
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Detalle
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Que revisar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {result.issues.slice(0, 12).map((issue, index) => (
                    <tr key={`${issue.type}-${issue.rowNumber ?? index}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">
                        {issue.rowNumber ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {issueTypeLabels[issue.type] ?? issue.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{issue.message}</td>
                      <td className="px-4 py-3 text-sm text-muted">{issueAction(issue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-shell transition hover:bg-accent/90"
              href={`/publicaciones?projectId=${projectId}&trackingState=WITH_SNAPSHOTS`}
            >
              Ver publicaciones con metricas
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-panel-raised px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/importaciones?projectId=${projectId}`}
            >
              Ver historial del proyecto
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-panel-raised px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              onClick={resetFlow}
              type="button"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Cargar otro CSV
            </button>
          </div>

          {result.counts.createdListings > 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Se crearon {countText(result.counts.createdListings, "publicacion minima", "publicaciones minimas")}.
              Conviene completarlas despues desde Publicaciones antes de usarlas como base de analisis.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
