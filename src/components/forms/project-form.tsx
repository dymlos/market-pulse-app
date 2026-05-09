import { ProjectStatus } from "@/generated/prisma";
import {
  currencyLabel,
  currencyOptions,
  marketplaceLabel,
  marketplaceOptions,
  projectCreationStatusOptions,
  projectStatusLabels,
  projectStatusOptions,
} from "@/lib/market-labels";

type ProjectFormValues = {
  id?: string;
  name?: string;
  marketplace?: string;
  currencyCode?: string;
  status?: ProjectStatus;
  notes?: string | null;
};

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectFormValues;
  submitLabel: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "text-sm font-semibold text-ink";
const helperClass = "mt-2 text-xs leading-5 text-muted";
const fieldsetClass = "rounded-2xl border border-line/80 bg-shell/40 p-5";

export function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  const selectedMarketplace = project?.marketplace ?? "mercado-libre";
  const selectedCurrency = project?.currencyCode ?? "ARS";
  const statusOptions =
    project?.status === ProjectStatus.ARCHIVED ? projectStatusOptions : projectCreationStatusOptions;
  const includesCurrentMarketplace = marketplaceOptions.some(
    (option) => option.value === selectedMarketplace,
  );
  const includesCurrentCurrency = currencyOptions.some((option) => option.value === selectedCurrency);

  return (
    <form action={action} className="max-w-6xl space-y-5">
      {project?.id ? <input type="hidden" name="projectId" value={project.id} /> : null}

      <div className={fieldsetClass}>
        <div className="mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Identidad y contexto
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Usa este espacio para agrupar una marca, seller o cuenta operativa. Todo lo que cargues
            después - publicaciones, cambios, imports y búsquedas - queda conectado a este proyecto.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="name">
              Nombre del proyecto <span className="text-accent">*</span>
            </label>
            <input
              aria-describedby="name-help"
              className={inputClass}
              defaultValue={project?.name ?? ""}
              id="name"
              minLength={2}
              name="name"
              placeholder="Ej. Tienda outdoor Argentina"
              required
            />
            <p className={helperClass} id="name-help">
              Obligatorio. Debería identificar rápido la cuenta, marca o unidad de trabajo.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="notes">
              Contexto operativo
            </label>
            <textarea
              className={`${inputClass} min-h-28`}
              defaultValue={project?.notes ?? ""}
              id="notes"
              name="notes"
              placeholder="Objetivo del seguimiento, tipo de cuenta, sensibilidad a precio, equipo responsable o contexto que convenga recordar."
            />
            <p className={helperClass}>
              Opcional. Sirve como memoria corta para entender por qué este proyecto existe.
            </p>
          </div>
        </div>
      </div>

      <div className={fieldsetClass}>
        <div className="mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Configuración operativa
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Estos valores ordenan filtros, labels y lectura de datos locales. No conectan APIs ni
            automatizan cargas externas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="marketplace">
              Marketplace principal
            </label>
            <select
              aria-describedby="marketplace-help"
              className={inputClass}
              defaultValue={selectedMarketplace}
              id="marketplace"
              name="marketplace"
              required
            >
              {!includesCurrentMarketplace ? (
                <option value={selectedMarketplace}>{marketplaceLabel(selectedMarketplace)}</option>
              ) : null}
              {marketplaceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className={helperClass} id="marketplace-help">
              Por defecto Mercado Libre, para mantener la demo enfocada en etapa 1.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="currencyCode">
              Moneda de trabajo
            </label>
            <select
              aria-describedby="currency-help"
              className={inputClass}
              defaultValue={selectedCurrency}
              id="currencyCode"
              name="currencyCode"
              required
            >
              {!includesCurrentCurrency ? (
                <option value={selectedCurrency}>{currencyLabel(selectedCurrency)}</option>
              ) : null}
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className={helperClass} id="currency-help">
              Controla cómo se muestran precios y métricas monetarias del proyecto.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="status">
              Estado operativo
            </label>
            <select
              aria-describedby="status-help"
              className={inputClass}
              defaultValue={project?.status ?? ProjectStatus.ACTIVE}
              id="status"
              name="status"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {projectStatusLabels[status]}
                </option>
              ))}
            </select>
            <p className={helperClass} id="status-help">
              Activo entra al flujo normal. Pausado conserva memoria sin tratarlo como foco actual.
              {project?.status === ProjectStatus.ARCHIVED
                ? " Si vuelve a estar activo, podés devolverlo al flujo desde acá."
                : " Para archivar, usá la acción de ciclo de vida con confirmación."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/70 bg-panel/45 p-4">
        <button
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
          type="submit"
        >
          {submitLabel}
        </button>
        <p className="text-sm leading-6 text-muted">
          Si salís sin guardar, los cambios no se aplican. Al guardar, la memoria operativa asociada
          se conserva.
        </p>
      </div>
    </form>
  );
}
