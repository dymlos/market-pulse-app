"use client";

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
  issues: Array<{
    rowNumber?: number;
    type: string;
    message: string;
    listingReference?: string;
  }>;
};

type CsvMetricImportPanelProps = {
  projects: ProjectOption[];
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "text-sm font-semibold text-ink";
const secondaryButtonClass =
  "rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:text-slate-400";
const primaryButtonClass =
  "rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400";

function formatListingOption(listing: ListingOption) {
  const reference = listing.sku || listing.externalId || listing.id;
  return `${listing.title} (${reference})`;
}

export function CsvMetricImportPanel({ projects }: CsvMetricImportPanelProps) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<MetricImportMapping>({});
  const [manualResolutions, setManualResolutions] = useState<Record<string, string>>({});
  const [createMissingListings, setCreateMissingListings] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  async function requestPreview() {
    if (!file || !projectId) {
      setError("Selecciona proyecto y archivo CSV.");
      return;
    }

    setIsPreviewing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);

    const response = await fetch("/api/importaciones/metricas/preview", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    setIsPreviewing(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "No se pudo previsualizar el CSV.");
      return;
    }

    setPreview(payload.preview);
    setMapping(payload.preview.suggestedMapping ?? {});
    setManualResolutions({});
  }

  async function requestImport() {
    if (!file || !projectId || !preview) {
      setError("Previsualiza el CSV antes de importar.");
      return;
    }

    setIsImporting(true);
    setError("");

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
    const payload = await response.json();

    setIsImporting(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo importar el CSV.");
      return;
    }

    setResult(payload.result);
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

  return (
    <div className="space-y-6">
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
              setPreview(null);
              setResult(null);
            }}
            value={projectId}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="csvFile">
            Archivo CSV
          </label>
          <input
            accept=".csv,text/csv"
            className={inputClass}
            id="csvFile"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setPreview(null);
              setResult(null);
            }}
            type="file"
          />
        </div>

        <button
          className={secondaryButtonClass}
          disabled={!file || !projectId || isPreviewing}
          onClick={requestPreview}
          type="button"
        >
          {isPreviewing ? "Previsualizando..." : "Previsualizar"}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-line bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Primero crea un proyecto activo para importar metricas.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {preview ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Filas
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">{preview.totalRows}</div>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Validables
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.validRows}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Invalidas
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.invalidRows}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Omitidas
              </div>
              <div className="mt-2 text-2xl font-semibold text-ink">
                {preview.validationSummary.skippedRows}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-ink">Mapping de columnas</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricImportFields.map((field) => (
                <div key={field.key}>
                  <label className={labelClass} htmlFor={`mapping-${field.key}`}>
                    {field.label}
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
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            <label className="flex items-start gap-3 text-sm font-semibold text-ink">
              <input
                checked={createMissingListings}
                className="mt-1"
                onChange={(event) => setCreateMissingListings(event.target.checked)}
                type="checkbox"
              />
              Crear publicaciones nuevas cuando una fila no encuentre un Listing existente
            </label>
          </div>

          {preview.unresolvedListingReferences.length > 0 ? (
            <div>
              <h3 className="text-base font-semibold text-ink">Vinculaciones manuales</h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-line">
                <table className="min-w-full divide-y divide-line text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Referencia CSV
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Listing existente
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {preview.unresolvedListingReferences.map((reference) => (
                      <tr key={reference}>
                        <td className="px-4 py-3 text-sm text-slate-700">{reference}</td>
                        <td className="px-4 py-3 text-sm">
                          <select
                            className="w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink"
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Fila
                    </th>
                    {preview.headers.map((header) => (
                      <th
                        className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                        key={header}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {preview.previewRows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {row.rowNumber}
                      </td>
                      {row.cells.map((cell, index) => (
                        <td
                          className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
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
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {[...preview.validationSummary.mappingErrors, ...preview.parseErrors.map((item) => item.message)]
                .slice(0, 6)
                .join(" ")}
            </div>
          ) : null}

          <button
            className={primaryButtonClass}
            disabled={isImporting || !selectedProject}
            onClick={requestImport}
            type="button"
          >
            {isImporting ? "Importando..." : "Importar snapshots"}
          </button>
        </div>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Resultado: {result.status}</h3>
              {result.importId ? (
                <p className="mt-1 text-xs text-slate-500">CsvImport {result.importId}</p>
              ) : null}
            </div>
            <div className="text-sm text-slate-600">
              {result.counts.validRows} validas / {result.counts.invalidRows} invalidas /{" "}
              {result.counts.skippedRows} omitidas
            </div>
          </div>

          {result.counts.createdListings > 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Se crearon {result.counts.createdListings} publicaciones nuevas.
            </p>
          ) : null}

          {result.issues.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Fila
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {result.issues.slice(0, 12).map((issue, index) => (
                    <tr key={`${issue.type}-${issue.rowNumber ?? index}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {issue.rowNumber ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {issue.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{issue.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
