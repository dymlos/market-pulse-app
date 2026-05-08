import Link from "next/link";

import { ProjectForm } from "@/components/forms/project-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { createProject } from "@/lib/market-actions";

type NuevoProyectoPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function NuevoProyectoPage({ searchParams }: NuevoProyectoPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nuevo proyecto"
        title="Crear proyecto"
        description="Crea el espacio de trabajo para una marca, seller o cuenta operativa. Después vas a cargar sus publicaciones y empezar la bitácora."
      />

      <FormMessage message={firstParam(params.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href="/proyectos"
          >
            Volver
          </Link>
        }
        title="Identidad y configuración"
        description="Deja cargados los datos mínimos para que el proyecto quede listo para publicaciones, cambios e imports."
      >
        <ProjectForm action={createProject} submitLabel="Crear proyecto" />
      </SectionCard>
    </div>
  );
}
