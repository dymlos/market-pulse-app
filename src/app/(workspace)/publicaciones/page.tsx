import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function PublicacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base del nucleo causal"
        title="Publicaciones"
        description="La estructura visual ya anticipa la futura relacion entre publicaciones propias, cambios registrados y snapshots metricos sin meter todavia la logica profunda."
      />

      <SectionCard
        title="Listado inicial"
        description="La tabla esta pensada para priorizar lectura rapida, estado y ultimo contexto disponible."
      >
        <DataTablePreview
          columns={["Publicacion", "Proyecto", "Estado", "Ultimo contexto"]}
          rows={[
            [
              "Auriculares Bluetooth Pro",
              "Cuenta principal ML",
              "Activa",
              "Sin snapshot cargado aun",
            ],
            [
              "Mouse ergonomico oficina",
              "Cuenta principal ML",
              "Pausada",
              "Esperando primer flujo real",
            ],
          ]}
        />
      </SectionCard>
    </div>
  );
}
