import Link from "next/link";

import { CsvMetricImportPanel } from "@/components/imports/csv-metric-import-panel";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, formatDateTime, type SearchParamsInput } from "@/lib/format";
import { getCsvImports, getProjectOptions } from "@/lib/market-data";
import {
  csvImportStatusLabels,
  csvImportStatusTone,
  csvImportTypeLabels,
} from "@/lib/market-labels";

type ImportacionesPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function ImportacionesPage({ searchParams }: ImportacionesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId) || "";
  const [projects, recentImports] = await Promise.all([
    getProjectOptions(),
    getCsvImports(selectedProjectId || undefined),
  ]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entradas de datos"
        title="Importaciones"
        description="Carga CSV local para convertir históricos de publicaciones en snapshots métricos reales."
      />

      <SectionCard
        title="Importar métricas de publicaciones"
        description="Flujo mínimo: subir CSV, revisar preview, mapear columnas y guardar snapshots por publicación."
      >
        <CsvMetricImportPanel projects={projects} selectedProjectId={selectedProjectId} />
      </SectionCard>

      <SectionCard
        title="Importaciones recientes"
        description={
          selectedProject
            ? `Registro local filtrado por ${selectedProject.name}.`
            : "Registro local guardado en CsvImport para auditar cargas completas, parciales o fallidas."
        }
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
              href="/importaciones"
            >
              Limpiar
            </Link>
          ) : null}
        </form>

        {recentImports.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-panel-raised">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Archivo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Filas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {recentImports.map((csvImport) => (
                    <tr key={csvImport.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {formatDateTime(csvImport.importedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {csvImport.project.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {csvImport.fileName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {csvImportTypeLabels[csvImport.type]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={csvImportStatusTone(csvImport.status)}>
                          {csvImportStatusLabels[csvImport.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {csvImport.validRows ?? 0} válidas / {csvImport.invalidRows ?? 0} inválidas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-6 text-sm leading-6 text-muted">
            {selectedProject
              ? "Todavía no hay importaciones registradas para este proyecto."
              : "Todavía no hay importaciones registradas."}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
