import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/forms/project-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { updateProject } from "@/lib/market-actions";
import { getProjectForEdit } from "@/lib/market-data";

type EditarProyectoPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function EditarProyectoPage({
  params,
  searchParams,
}: EditarProyectoPageProps) {
  const { projectId } = await params;
  const query = (await searchParams) ?? {};
  const project = await getProjectForEdit(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Editar proyecto"
        title={project.name}
        description="Actualiza datos basicos sin perder la memoria operativa asociada."
      />

      <FormMessage message={firstParam(query.error)} />

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
        <ProjectForm action={updateProject} project={project} submitLabel="Guardar cambios" />
      </SectionCard>
    </div>
  );
}
