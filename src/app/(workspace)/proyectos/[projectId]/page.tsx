import Link from "next/link";
import { Archive, ClipboardList, Package, Search } from "lucide-react";
import { notFound } from "next/navigation";

import { ArchiveProjectForm } from "@/components/projects/archive-project-form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ProjectStatus } from "@/generated/prisma";
import {
  firstParam,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  type SearchParamsInput,
} from "@/lib/format";
import {
  changeEventTypeLabels,
  csvImportStatusLabels,
  csvImportStatusTone,
  marketplaceLabel,
  projectStatusLabels,
  projectStatusTone,
} from "@/lib/market-labels";
import { getProjectDetail } from "@/lib/market-data";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<SearchParamsInput>;
};

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const search = (await searchParams) ?? {};
  const detail = await getProjectDetail(projectId);

  if (!detail) {
    notFound();
  }

  const { project, changeEventsCount, metricSnapshotsCount, recentChanges } = detail;
  const created = firstParam(search.created);
  const updated = firstParam(search.updated);
  const archived = firstParam(search.archived);
  const isArchived = project.status === ProjectStatus.ARCHIVED;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proyecto"
        title={project.name}
        description="Contexto operativo de esta marca, seller o cuenta: qué publicaciones contiene, qué memoria ya tiene cargada y cuál es el próximo paso útil."
      />

      {created ? (
        <FormMessage
          tone="success"
          message="Proyecto creado. El siguiente paso recomendado es cargar una publicación propia."
        />
      ) : null}
      {updated ? <FormMessage tone="success" message="Proyecto actualizado correctamente." /> : null}
      {archived ? (
        <FormMessage
          tone="success"
          message="Proyecto archivado. La memoria queda conservada y sale del flujo activo."
        />
      ) : null}

      <SectionCard
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href="/proyectos"
            >
              Volver
            </Link>
            <Link
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={`/proyectos/${project.id}/editar`}
            >
              Editar
            </Link>
            {!isArchived ? (
              <Link
                className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell transition hover:bg-accent/90"
                href={`/publicaciones/nueva?projectId=${project.id}`}
              >
                Nueva publicación
              </Link>
            ) : null}
          </div>
        }
        title="Identidad operativa"
        description="Resumen corto para entender qué representa este proyecto antes de revisar sus publicaciones o cambios."
      >
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          <div className="bg-panel-raised p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Estado
            </dt>
            <dd className="mt-2">
              <Badge tone={projectStatusTone(project.status)}>
                {projectStatusLabels[project.status]}
              </Badge>
            </dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Marketplace
            </dt>
            <dd className="mt-2 text-sm font-semibold text-ink">
              {marketplaceLabel(project.marketplace)}
            </dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Moneda
            </dt>
            <dd className="mt-2 text-sm font-semibold text-ink">{project.currencyCode}</dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Actualizado
            </dt>
            <dd className="mt-2 text-sm font-semibold text-ink">
              {formatRelativeDate(project.updatedAt)}
            </dd>
            <dd className="mt-1 text-xs text-muted">{formatDateTime(project.updatedAt)}</dd>
          </div>
        </dl>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <h3 className="text-sm font-semibold text-ink">Contexto recordado</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {project.notes || "Este proyecto todavía no tiene contexto operativo escrito."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Siguiente paso útil</h3>
            {project._count.listings === 0 ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                Carga una publicación propia para empezar a registrar cambios, snapshots métricos y
                aprendizajes.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted">
                Revisa publicaciones, registra el próximo cambio o importa métricas para sostener la
                bitácora causal.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Actividad conectada"
        description="Lectura rápida de la memoria ya asociada al proyecto. No agrega datos nuevos: solo ordena lo existente."
      >
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            className="inline-flex rounded-2xl border border-line bg-panel-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/publicaciones?projectId=${project.id}`}
          >
            Ir a publicaciones
          </Link>
          <Link
            className="inline-flex rounded-2xl border border-line bg-panel-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/competencia?projectId=${project.id}`}
          >
            Ir a búsquedas
          </Link>
          <Link
            className="inline-flex rounded-2xl border border-line bg-panel-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            href={`/importaciones?projectId=${project.id}`}
          >
            Ir a imports
          </Link>
        </div>

        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          <div className="bg-panel-raised p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Package className="h-4 w-4 text-accent" aria-hidden="true" />
              Publicaciones
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">{project._count.listings}</dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardList className="h-4 w-4 text-accent" aria-hidden="true" />
              Cambios
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">{changeEventsCount}</dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="text-sm font-semibold text-ink">Snapshots métricos</dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">{metricSnapshotsCount}</dd>
          </div>
          <div className="bg-panel-raised p-4">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Search className="h-4 w-4 text-accent" aria-hidden="true" />
              Búsquedas
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-ink">
              {project._count.trackedSearches}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Publicaciones recientes</h3>
              <Link
                className="text-sm font-semibold text-accent hover:text-ink"
                href={`/publicaciones?projectId=${project.id}`}
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {project.listings.length > 0 ? (
                project.listings.map((listing) => (
                  <div key={listing.id} className="p-4">
                    <Link
                      className="font-semibold text-ink hover:text-accent"
                      href={`/publicaciones/${listing.id}`}
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {listing._count.changeEvents} cambios / {listing._count.metricSnapshots} snapshots
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-muted">
                  Todavía no hay publicaciones cargadas para este proyecto.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Cambios recientes</h3>
              <Link
                className="text-sm font-semibold text-accent hover:text-ink"
                href={`/cambios?projectId=${project.id}`}
              >
                Ver bitácora
              </Link>
            </div>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {recentChanges.length > 0 ? (
                recentChanges.map((change) => (
                  <div key={change.id} className="p-4">
                    <Link
                      className="font-semibold text-ink hover:text-accent"
                      href={`/cambios/${change.id}`}
                    >
                      {changeEventTypeLabels[change.type]} · {change.detail}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(change.occurredAt)} · {change.listing.title}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-muted">
                  Todavía no hay cambios registrados dentro de este proyecto.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Búsquedas monitoreadas</h3>
              <Link
                className="text-sm font-semibold text-accent hover:text-ink"
                href={`/competencia?projectId=${project.id}`}
              >
                Ver competencia
              </Link>
            </div>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {project.trackedSearches.length > 0 ? (
                project.trackedSearches.map((searchItem) => (
                  <div key={searchItem.id} className="p-4">
                    <Link
                      className="font-semibold text-ink hover:text-accent"
                      href={`/competencia/${searchItem.id}`}
                    >
                      {searchItem.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {searchItem.query} · {searchItem._count.snapshots} snapshots
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-muted">
                  Todavía no hay búsquedas monitoreadas para este proyecto.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Imports recientes</h3>
              <Link
                className="text-sm font-semibold text-accent hover:text-ink"
                href={`/importaciones?projectId=${project.id}`}
              >
                Ver imports
              </Link>
            </div>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {project.csvImports.length > 0 ? (
                project.csvImports.map((csvImport) => (
                  <div key={csvImport.id} className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <div className="font-semibold text-ink">{csvImport.fileName}</div>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(csvImport.importedAt)}
                      </p>
                    </div>
                    <Badge tone={csvImportStatusTone(csvImport.status)}>
                      {csvImportStatusLabels[csvImport.status]}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-muted">
                  Todavía no hay imports asociados a este proyecto.
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Ciclo de vida"
        title="Archivar conserva la memoria"
        description="Archivar no elimina publicaciones, cambios, imports ni contexto competitivo. Solo saca el proyecto del flujo activo para que no compita con cuentas vigentes."
        action={
          isArchived ? (
            <Badge tone="muted">Archivado</Badge>
          ) : (
            <ArchiveProjectForm projectId={project.id} projectName={project.name} />
          )
        }
      >
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-panel-raised p-4 text-sm leading-6 text-muted">
          <Archive className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p>
            En etapa 1 no hay eliminación desde la interfaz. La decisión de producto es preservar
            historial operativo para no perder aprendizajes ni romper relaciones con publicaciones.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
