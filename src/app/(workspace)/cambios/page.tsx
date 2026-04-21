import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function CambiosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bitacora operativa"
        title="Cambios"
        description="Este modulo es el corazon futuro del producto. Por ahora queda lista la pantalla base para registrar eventos y despues conectar impacto probable, evidencia y aprendizaje."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Vista de eventos"
          description="Todavia no hay registros reales, pero la tabla y el copy ya respetan la logica de atribucion prudente del producto."
        >
          <DataTablePreview
            columns={["Fecha", "Publicacion", "Cambio", "Lectura inicial"]}
            rows={[
              ["2026-04-21", "Auriculares Bluetooth Pro", "Ajuste de precio", "Pendiente de evidencia"],
              ["2026-04-21", "Mouse ergonomico oficina", "Cambio de titulo", "Sin impacto medido aun"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Regla de copy"
          title="Como hablar de impacto"
          description="La app tiene que sostener siempre un lenguaje prudente."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>Usar impacto probable, explicacion mixta y atribucion debil, moderada o fuerte.</li>
            <li>No afirmar causalidad exacta sin evidencia suficiente.</li>
            <li>Registrar razon del cambio, actor y contexto observable.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
