import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingForm } from "@/components/forms/listing-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { updateListing } from "@/lib/market-actions";
import { getListingForEdit, getProjectOptions } from "@/lib/market-data";

type EditarPublicacionPageProps = {
  params: Promise<{ listingId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function EditarPublicacionPage({
  params,
  searchParams,
}: EditarPublicacionPageProps) {
  const { listingId } = await params;
  const query = (await searchParams) ?? {};
  const [listing, projects] = await Promise.all([
    getListingForEdit(listingId),
    getProjectOptions(),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Editar publicacion"
        title={listing.title}
        description="Actualiza datos operativos basicos. Los cambios de negocio conviene registrarlos tambien en la bitacora."
      />

      <FormMessage message={firstParam(query.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/publicaciones/${listing.id}`}
          >
            Volver
          </Link>
        }
        title="Datos de la publicacion"
      >
        <ListingForm
          action={updateListing}
          listing={listing}
          projects={projects}
          submitLabel="Guardar cambios"
        />
      </SectionCard>
    </div>
  );
}
