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

function safeReturnPath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export default async function NuevoCambioPage({ searchParams }: NuevoCambioPageProps) {
  const params = (await searchParams) ?? {};
  const selectedListingId = firstParam(params.listingId);
  const returnTo =
    safeReturnPath(firstParam(params.returnTo)) ??
    (selectedListingId ? `/publicaciones/${selectedListingId}#timeline-causal` : undefined);
  const backHref = returnTo ?? "/cambios";
  const listings = await getListingOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Memoria operativa"
        title="Registrar cambio operativo"
        description="Guarda que se toco, por que se hizo y que esperabas observar despues para poder leer el impacto con datos posteriores."
      />

      <FormMessage message={firstParam(params.error)} />

      <SectionCard
        action={
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={backHref}
          >
            Volver
          </Link>
        }
        title="Memoria del cambio"
        description="Una buena bitacora no necesita ser larga: necesita dejar claro el antes, el despues esperado y el contexto observable."
      >
        <ChangeEventForm
          action={createChangeEvent}
          listings={listings}
          returnTo={returnTo}
          selectedListingId={selectedListingId}
          submitLabel="Registrar cambio"
        />
      </SectionCard>
    </div>
  );
}
