import Link from "next/link";
import { notFound } from "next/navigation";

import { TrackedSearchForm } from "@/components/forms/tracked-search-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { updateTrackedSearch } from "@/lib/market-actions";
import { getProjectOptions, getTrackedSearchForEdit } from "@/lib/market-data";

type EditarBusquedaPageProps = {
  params: Promise<{ trackedSearchId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function EditarBusquedaPage({
  params,
  searchParams,
}: EditarBusquedaPageProps) {
  const { trackedSearchId } = await params;
  const queryParams = (await searchParams) ?? {};
  const [trackedSearch, projects] = await Promise.all([
    getTrackedSearchForEdit(trackedSearchId),
    getProjectOptions(),
  ]);

  if (!trackedSearch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Editar busqueda"
        title={trackedSearch.name}
        description="Ajusta datos basicos de la busqueda monitoreada sin cambiar sus snapshots historicos."
      />

      <FormMessage message={firstParam(queryParams.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/competencia/${trackedSearch.id}`}
          >
            Volver
          </Link>
        }
        title="Datos de la busqueda"
      >
        <TrackedSearchForm action={updateTrackedSearch} projects={projects} trackedSearch={trackedSearch} />
      </SectionCard>
    </div>
  );
}
