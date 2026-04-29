import Link from "next/link";

import { ChangeEventForm } from "@/components/forms/change-event-form";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { firstParam, type SearchParamsInput } from "@/lib/format";
import { createChangeEvent } from "@/lib/market-actions";
import { getListingOptions } from "@/lib/market-data";

type NuevoCambioPageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function NuevoCambioPage({ searchParams }: NuevoCambioPageProps) {
  const params = (await searchParams) ?? {};
  const selectedListingId = firstParam(params.listingId);
  const listings = await getListingOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registrar cambio"
        title="Nuevo cambio operativo"
        description="Carga rapida para guardar que se toco, cuando, con que valor anterior/nuevo y que contexto conviene recordar."
      />

      <FormMessage message={firstParam(params.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href="/cambios"
          >
            Volver
          </Link>
        }
        title="Datos del cambio"
        description="Formulario liviano: descripcion, fecha y valores opcionales. La explicacion queda prudente y manual."
      >
        <ChangeEventForm
          action={createChangeEvent}
          listings={listings}
          selectedListingId={selectedListingId}
          submitLabel="Registrar cambio"
        />
      </SectionCard>
    </div>
  );
}
