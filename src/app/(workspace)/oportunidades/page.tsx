import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function OportunidadesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capa accionable"
        title="Oportunidades"
        description="La pantalla base queda lista para futuras senales accionables, siempre conectadas a contexto real y a una posible accion medible posterior."
      />

      <SectionCard
        title="Senales previstas"
        description="Las oportunidades van a vivir mejor cuando existan cambios, snapshots metricos y contexto competitivo minimo cargado."
      >
        <DataTablePreview
          columns={["Oportunidad", "Prioridad", "Estado"]}
          rows={[
            ["Caida de visibilidad tras cambio de titulo", "Media", "Pendiente"],
            ["Hueco de precio observado en snapshot", "Alta", "Pendiente"],
            ["Busqueda sin presencia propia sostenida", "Media", "Pendiente"],
          ]}
        />
      </SectionCard>
    </div>
  );
}
