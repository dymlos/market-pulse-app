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
        description="Carga el espacio de trabajo que va a agrupar publicaciones, cambios y contexto operativo."
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
        title="Datos del proyecto"
      >
        <ProjectForm action={createProject} submitLabel="Crear proyecto" />
      </SectionCard>
    </div>
  );
}
