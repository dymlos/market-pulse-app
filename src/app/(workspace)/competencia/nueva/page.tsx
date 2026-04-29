import Link from "next/link";

import { TrackedSearchForm } from "@/components/forms/tracked-search-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { createTrackedSearch } from "@/lib/market-actions";
import { getProjectOptions } from "@/lib/market-data";

type NuevaBusquedaPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function NuevaBusquedaPage({ searchParams }: NuevaBusquedaPageProps) {
  const params = (await searchParams) ?? {};
  const projects = await getProjectOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nueva busqueda"
        title="Crear busqueda monitoreada"
        description="Carga una query critica para guardar snapshots manuales o importados mas adelante."
      />

      <FormMessage message={firstParam(params.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href="/competencia"
          >
            Volver
          </Link>
        }
        title="Datos de la busqueda"
      >
        <TrackedSearchForm
          action={createTrackedSearch}
          projects={projects}
          selectedProjectId={firstParam(params.projectId)}
        />
      </SectionCard>
    </div>
  );
}
