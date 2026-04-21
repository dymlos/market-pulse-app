import { DataTablePreview } from "@/components/ui/data-table-preview";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel inicial"
        title="Dashboard operativo de arranque"
        description="Esta pantalla resume la base tecnica ya lista para trabajar en localhost y deja visible el norte del producto: memoria operativa, explicacion probable y contexto competitivo minimo."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="App base"
          value="Lista"
          detail="Next.js, TypeScript y Tailwind ya componen la shell general del producto."
        />
        <MetricCard
          label="Persistencia"
          value="SQLite"
          detail="Prisma queda preparado para guardar datos locales sin depender de infraestructura externa."
        />
        <MetricCard
          label="Navegacion"
          value="8 modulos"
          detail="Las secciones principales del MVP ya existen para ordenar el crecimiento del producto."
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          eyebrow="Foco del MVP"
          title="Lo que esta base ya deja encaminado"
          description="El scaffold esta preparado para crecer primero sobre causalidad y memoria operativa, y despues sobre contexto competitivo y oportunidades."
        >
          <DataTablePreview
            columns={["Modulo", "Estado", "Siguiente paso"]}
            rows={[
              ["Proyectos", "Base visual lista", "CRUD inicial y relacion con publicaciones"],
              ["Publicaciones", "Base visual lista", "Alta, edicion y vinculacion con snapshots"],
              ["Cambios", "Base visual lista", "Registrar eventos operativos con contexto"],
              ["Importaciones", "Base visual lista", "Subida de CSV y validacion"],
              ["Competencia", "Base visual lista", "Snapshots manuales y busquedas monitoreadas"],
              ["Oportunidades", "Base visual lista", "Senales simples derivadas del contexto"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Tesis del producto"
          title="Criterio para las siguientes iteraciones"
          description="Si una decision no mejora la respuesta a que tocamos, que paso despues y que aprendemos, probablemente no sea prioridad."
        >
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              La app no busca ser otro dashboard generico ni una suite de market intelligence.
              Esta base ya ordena la navegacion alrededor de memoria operativa y causalidad.
            </p>
            <p>
              Competencia y oportunidades entran como capas utiles, pero subordinadas al registro
              de cambios, metrica y explicacion probable.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
