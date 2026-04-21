import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function CompetenciaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contexto complementario"
        title="Competencia"
        description="Este modulo queda preparado como contexto minimo: snapshots manuales, busquedas monitoreadas y comparacion simple. No se posiciona como suite competitiva independiente."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Busquedas monitoreadas"
          description="Ejemplo de la estructura que mas adelante va a alojar snapshots manuales y observaciones de share of shelf."
        >
          <DataTablePreview
            columns={["Busqueda", "Ultimo snapshot", "Lectura"]}
            rows={[
              ["auriculares bluetooth", "Pendiente", "Sin evidencia suficiente"],
              ["mouse ergonomico", "Pendiente", "Modulo listo para carga manual"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Enfoque"
          title="Que no hacer aca"
          description="La documentacion es clara: competencia es contexto, no el nucleo inicial del producto."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>No convertir este modulo en un radar generico de ganadores.</li>
            <li>No depender de scraping masivo para que el producto sea util.</li>
            <li>Usar snapshots puntuales para enriquecer la lectura causal.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
