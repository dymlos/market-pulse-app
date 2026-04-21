import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function ImportacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entradas de datos"
        title="Importaciones"
        description="La etapa 1 prioriza carga manual y CSV. Esta pantalla deja el punto de entrada visual para los futuros flujos de importacion sin depender de APIs externas."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Fuentes previstas"
          description="Ordenadas por la filosofia local-first definida en la documentacion."
        >
          <DataTablePreview
            columns={["Fuente", "Prioridad", "Lectura"]}
            rows={[
              ["Carga manual", "Alta", "Siempre disponible en local"],
              ["CSV", "Alta", "Flujo principal del MVP"],
              ["Google Sheets", "Media", "Opcional para una etapa posterior"],
              ["APIs externas", "Baja", "No bloquean esta primera version"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Siguiente bloque"
          title="Que falta implementar"
          description="El siguiente paso concreto es construir el flujo de parseo, validacion y persistencia de archivos CSV para snapshots metricos y eventos de cambio."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>Selector de archivo.</li>
            <li>Vista previa de columnas y errores comunes.</li>
            <li>Registro del import como job local.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
