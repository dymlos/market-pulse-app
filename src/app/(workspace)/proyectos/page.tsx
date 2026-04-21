import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function ProyectosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base de organizacion"
        title="Proyectos"
        description="Esta seccion queda lista para agrupar sellers, marcas, cuentas o frentes operativos. El siguiente paso natural es agregar CRUD y relaciones con publicaciones."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Vista inicial de proyectos"
          description="Tabla pensada para una operacion desktop-first, con foco en legibilidad y contexto rapido."
        >
          <DataTablePreview
            columns={["Proyecto", "Marketplace", "Estado", "Objetivo operativo"]}
            rows={[
              ["Cuenta principal ML", "Mercado Libre", "Activo", "Ordenar cambios y medir impacto"],
              ["Marca piloto", "Mercado Libre", "Pausado", "Preparado para futura carga real"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Preparado"
          title="Que deberia entrar despues"
          description="El bloque siguiente tiene que habilitar alta, edicion, archivado y la relacion de cada proyecto con publicaciones, importaciones y oportunidades."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>Campos base: nombre, slug, marketplace, estado y notas.</li>
            <li>Vinculo claro con publicaciones propias.</li>
            <li>Base para imports por proyecto y futuras vistas comparativas.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
