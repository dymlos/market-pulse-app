import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateTime } from "@/lib/format";
import { changeEventTypeLabels } from "@/lib/market-labels";
import { getChangeEventDetail } from "@/lib/market-data";

type CambioDetallePageProps = {
  params: Promise<{ changeId: string }>;
};

export default async function CambioDetallePage({ params }: CambioDetallePageProps) {
  const { changeId } = await params;
  const change = await getChangeEventDetail(changeId);

  if (!change) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de cambio"
        title={change.detail}
        description="Registro operativo puntual. Aca todavia no se afirma causalidad; se conserva evidencia para el timeline."
      />

      <SectionCard
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/cambios/${change.id}/editar`}
            >
              Editar
            </Link>
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/publicaciones/${change.listingId}`}
            >
              Ver publicacion
            </Link>
          </div>
        }
        title="Registro"
        description="Datos guardados en SQLite local via Prisma."
      >
        <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Fecha
            </dt>
            <dd className="mt-2 font-semibold text-ink">{formatDateTime(change.occurredAt)}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Tipo
            </dt>
            <dd className="mt-2">
              <Badge>{changeEventTypeLabels[change.type]}</Badge>
            </dd>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Responsable
            </dt>
            <dd className="mt-2 font-semibold text-ink">{change.actorName ?? "Sin dato"}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Proyecto
            </dt>
            <dd className="mt-2 font-semibold text-ink">{change.listing.project.name}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3 md:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Publicacion
            </dt>
            <dd className="mt-2 font-semibold text-ink">{change.listing.title}</dd>
          </div>
        </dl>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Valor anterior
            </div>
            <div className="mt-2 text-sm font-semibold text-ink">
              {change.previousValue ?? "No informado"}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-panel px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Valor nuevo
            </div>
            <div className="mt-2 text-sm font-semibold text-ink">
              {change.newValue ?? "No informado"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Comentario
            </div>
            <p className="mt-2 text-sm leading-6 text-ink">
              {change.comment ?? "Sin comentario adicional."}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Hipotesis
            </div>
            <p className="mt-2 text-sm leading-6 text-ink">
              {change.hypothesis ?? "Sin hipotesis registrada."}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
