import Link from "next/link";

import { ListingForm } from "@/components/forms/listing-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { createListing } from "@/lib/market-actions";
import { getProjectOptions } from "@/lib/market-data";

type NuevaPublicacionPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function NuevaPublicacionPage({ searchParams }: NuevaPublicacionPageProps) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = firstParam(params.projectId);
  const projects = await getProjectOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nueva publicacion"
        title="Crear publicacion"
        description="Carga la unidad de seguimiento donde despues vas a registrar cambios, importar metricas y leer impacto probable."
      />

      <FormMessage message={firstParam(params.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href="/publicaciones"
          >
            Volver
          </Link>
        }
        title="Alta de publicacion"
        description="Empeza con identidad y estado actual. La memoria causal crece cuando registres cambios y snapshots."
      >
        <ListingForm
          action={createListing}
          projects={projects}
          selectedProjectId={selectedProjectId}
          submitLabel="Crear publicacion"
        />
      </SectionCard>
    </div>
  );
}
