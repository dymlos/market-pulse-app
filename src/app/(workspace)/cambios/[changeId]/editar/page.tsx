import Link from "next/link";
import { notFound } from "next/navigation";

import { ChangeEventForm } from "@/components/forms/change-event-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { updateChangeEvent } from "@/lib/market-actions";
import { getChangeEventForEdit, getListingOptions } from "@/lib/market-data";

type EditarCambioPageProps = {
  params: Promise<{ changeId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function EditarCambioPage({ params, searchParams }: EditarCambioPageProps) {
  const { changeId } = await params;
  const query = (await searchParams) ?? {};
  const [changeEvent, listings] = await Promise.all([
    getChangeEventForEdit(changeId),
    getListingOptions(),
  ]);

  if (!changeEvent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Editar cambio"
        title={changeEvent.detail}
        description="Ajusta el registro operativo sin perder su vinculacion con la publicacion."
      />

      <FormMessage message={firstParam(query.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/cambios/${changeEvent.id}`}
          >
            Volver
          </Link>
        }
        title="Datos del cambio"
      >
        <ChangeEventForm
          action={updateChangeEvent}
          changeEvent={changeEvent}
          listings={listings}
          submitLabel="Guardar cambios"
        />
      </SectionCard>
    </div>
  );
}
