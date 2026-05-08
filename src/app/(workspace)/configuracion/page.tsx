import { DataTablePreview } from "@/components/ui/data-table-preview";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base técnica"
        title="Configuración"
        description="Resumen técnico del scaffold actual para que el siguiente bloque arranque con contexto claro, scripts consistentes y persistencia local ya preparada."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Stack actual"
          description="Dependencias elegidas por simplicidad, mantenibilidad y buena experiencia local."
        >
          <DataTablePreview
            columns={["Capa", "Tecnologia", "Rol"]}
            rows={[
              ["UI", "Next.js + TypeScript", "App Router y vistas operativas"],
              ["Estilos", "Tailwind CSS", "Layout claro y consistente"],
              ["Persistencia", "Prisma + SQLite", "Datos locales y esquema simple"],
              ["Runtime", "npm", "Instalacion y scripts verificados"],
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Entorno local"
          description="Referencia técnica relegada a configuración para no ensuciar las pantallas operativas."
        >
          <DataTablePreview
            columns={["Dato", "Valor", "Uso"]}
            rows={[
              ["Servidor", "localhost:3000", "URL esperada durante la demo local"],
              ["Persistencia", "SQLite local", "Base local-first de etapa 1"],
            ]}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Comandos locales"
          title="Flujo recomendado"
          description="Comandos listos para arrancar, validar y seguir construyendo."
        >
          <div className="space-y-3 rounded-2xl border border-line bg-shell p-4 font-mono text-sm text-ink">
            <div>npm install</div>
            <div>npm run db:push</div>
            <div>npm run dev</div>
            <div>npm run lint</div>
            <div>npm run build</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
