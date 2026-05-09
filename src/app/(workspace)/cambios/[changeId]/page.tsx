import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Clock3, FileText, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeDate,
} from "@/lib/format";
import { changeEventTypeLabels } from "@/lib/market-labels";
import { getChangeEventDetail } from "@/lib/market-data";

type CambioDetallePageProps = {
  params: Promise<{ changeId: string }>;
};

type SnapshotSummary = {
  snapshotDate: Date;
  visits: number | null;
  salesUnits: number | null;
  conversionRate: number | null;
  revenue: number | null;
  availableStock: number | null;
  price: number | null;
};

function getFollowUpState(change: {
  previousSnapshot: SnapshotSummary | null;
  followUpSnapshot: SnapshotSummary | null;
}) {
  if (change.previousSnapshot && change.followUpSnapshot) {
    return {
      label: "Lectura disponible",
      detail: "Hay snapshots antes y despues para revisar impacto probable.",
      tone: "success" as const,
    };
  }

  if (change.followUpSnapshot) {
    return {
      label: "Con seguimiento",
      detail: "Ya existe un snapshot posterior; falta comparar contra un snapshot previo si no estaba cargado.",
      tone: "success" as const,
    };
  }

  return {
    label: "Sin seguimiento",
    detail: "Todavia no hay snapshot metrico posterior a este cambio.",
    tone: "warning" as const,
  };
}

function SnapshotCard({
  currencyCode,
  label,
  snapshot,
}: {
  currencyCode: string;
  label: string;
  snapshot: SnapshotSummary | null;
}) {
  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
        <p className="mt-2 leading-6">Sin snapshot disponible para este lado de la lectura.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
      <p className="mt-2 font-semibold">{formatDate(snapshot.snapshotDate)}</p>
      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
        <span>Visitas: {formatNumber(snapshot.visits)}</span>
        <span>Ventas: {formatNumber(snapshot.salesUnits)}</span>
        <span>Conversion: {formatPercent(snapshot.conversionRate)}</span>
        <span>Facturacion: {formatCurrency(snapshot.revenue, currencyCode)}</span>
        <span>Stock: {formatNumber(snapshot.availableStock)}</span>
        <span>Precio: {formatCurrency(snapshot.price, currencyCode)}</span>
      </div>
    </div>
  );
}

export default async function CambioDetallePage({ params }: CambioDetallePageProps) {
  const { changeId } = await params;
  const change = await getChangeEventDetail(changeId);

  if (!change) {
    notFound();
  }

  const followUp = getFollowUpState(change);
  const timelineHref = `/publicaciones/${change.listingId}#timeline-causal`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lectura del cambio"
        title={change.detail}
        description="Registro operativo puntual: que se toco, que se esperaba y si ya hay datos posteriores para leer impacto probable."
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
            <Link
              className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell transition hover:bg-accent/90"
              href={timelineHref}
            >
              Ver timeline
            </Link>
          </div>
        }
        title="Decision registrada"
        description="La bitacora conserva la accion y la intencion; la evidencia posterior se revisa con snapshots metricos."
      >
        <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Fecha
            </dt>
            <dd className="mt-2 font-semibold text-ink">{formatRelativeDate(change.occurredAt)}</dd>
            <dd className="mt-1 text-xs text-muted">{formatDateTime(change.occurredAt)}</dd>
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
              Seguimiento
            </dt>
            <dd className="mt-2">
              <Badge tone={followUp.tone}>{followUp.label}</Badge>
            </dd>
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
            <dd className="mt-2 font-semibold text-ink">
              <Link className="hover:text-accent" href={`/publicaciones/${change.listingId}`}>
                {change.listing.title}
              </Link>
            </dd>
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
              Hipotesis
            </div>
            <p className="mt-2 text-sm leading-6 text-ink">
              {change.hypothesis ?? "Sin hipotesis registrada."}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Contexto operativo
            </div>
            <p className="mt-2 text-sm leading-6 text-ink">
              {change.comment ?? "Sin comentario adicional."}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        action={
          change.followUpSnapshot ? (
            <Link
              className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={timelineHref}
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Abrir timeline
            </Link>
          ) : (
            <Link
              className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/importaciones?projectId=${change.listing.project.id}`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Cargar metricas
            </Link>
          )
        }
        title="Seguimiento posterior"
        description={followUp.detail}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <SnapshotCard
            currencyCode={change.listing.project.currencyCode}
            label="Snapshot anterior"
            snapshot={change.previousSnapshot}
          />
          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <SnapshotCard
            currencyCode={change.listing.project.currencyCode}
            label="Snapshot posterior"
            snapshot={change.followUpSnapshot}
          />
        </div>

        {!change.followUpSnapshot ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm leading-6 text-warning">
            <Clock3 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Para cerrar la lectura de este cambio, importa o carga un snapshot posterior de la
              publicacion. Sin ese dato, la atribucion queda pendiente.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm leading-6 text-muted">
          <FileText className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p>
            Esta comparacion orienta la revision operativa. No prueba causalidad por si sola:
            conviene leerla junto con el timeline, competencia y contexto cargado.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
