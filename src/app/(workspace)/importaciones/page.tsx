import { Badge } from "@/components/ui/badge";
import { CsvMetricImportPanel } from "@/components/imports/csv-metric-import-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateTime } from "@/lib/format";
import { getCsvImports, getProjectOptions } from "@/lib/market-data";
import {
  csvImportStatusLabels,
  csvImportStatusTone,
  csvImportTypeLabels,
} from "@/lib/market-labels";

export default async function ImportacionesPage() {
  const [projects, recentImports] = await Promise.all([getProjectOptions(), getCsvImports()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entradas de datos"
        title="Importaciones"
        description="Carga CSV local para convertir historicos de publicaciones en snapshots metricos reales."
      />

      <SectionCard
        title="Importar metricas de publicaciones"
        description="Flujo minimo: subir CSV, revisar preview, mapear columnas y guardar snapshots por publicacion."
      >
        <CsvMetricImportPanel projects={projects} />
      </SectionCard>

      <SectionCard
        title="Importaciones recientes"
        description="Registro local guardado en CsvImport para auditar cargas completas, parciales o fallidas."
      >
        {recentImports.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Proyecto
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Archivo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Filas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {recentImports.map((csvImport) => (
                    <tr key={csvImport.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {formatDateTime(csvImport.importedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {csvImport.project.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {csvImport.fileName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {csvImportTypeLabels[csvImport.type]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Badge tone={csvImportStatusTone(csvImport.status)}>
                          {csvImportStatusLabels[csvImport.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                        {csvImport.validRows ?? 0} validas / {csvImport.invalidRows ?? 0} invalidas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            Todavia no hay importaciones registradas.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
