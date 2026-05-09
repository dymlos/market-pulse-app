import { ListingStatus } from "@/generated/prisma";
import { listingStatusLabels, listingStatusOptions } from "@/lib/market-labels";

type ProjectOption = {
  id: string;
  name: string;
  marketplace: string;
  currencyCode: string;
};

type ListingFormValues = {
  id?: string;
  projectId?: string;
  externalId?: string | null;
  sku?: string | null;
  title?: string;
  status?: ListingStatus;
  marketplace?: string;
  permalink?: string | null;
  categoryName?: string | null;
  brand?: string | null;
  currentPrice?: number | null;
  availableStock?: number | null;
  notes?: string | null;
};

type ListingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  listing?: ListingFormValues;
  projects: ProjectOption[];
  selectedProjectId?: string;
  submitLabel: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:bg-panel disabled:text-muted";
const labelClass = "text-sm font-semibold text-ink";
const helpClass = "mt-2 text-xs leading-5 text-muted";
const groupClass = "space-y-4 rounded-2xl border border-line bg-panel/50 p-4";

export function ListingForm({
  action,
  listing,
  projects,
  selectedProjectId,
  submitLabel,
}: ListingFormProps) {
  const defaultProjectId = listing?.projectId ?? selectedProjectId ?? projects[0]?.id ?? "";
  const defaultProject = projects.find((project) => project.id === defaultProjectId);

  return (
    <form action={action} className="max-w-6xl space-y-5">
      {listing?.id ? <input type="hidden" name="listingId" value={listing.id} /> : null}

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Identidad operativa</legend>
        <p className="text-xs leading-5 text-muted">
          Datos para reconocer la publicacion propia y conectarla con proyecto, cambios e imports.
        </p>

        <div>
          <label className={labelClass} htmlFor="projectId">
            Proyecto *
          </label>
          <select
            className={inputClass}
            defaultValue={defaultProjectId}
            disabled={projects.length === 0}
            id="projectId"
            name="projectId"
            required
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <p className={projects.length === 0 ? "mt-2 text-sm leading-6 text-warning" : helpClass}>
            {projects.length === 0
              ? "Primero crea un proyecto activo para cargar publicaciones."
              : "El proyecto define la cuenta o marca donde quedara la memoria de esta publicacion."}
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="title">
            Titulo de la publicacion *
          </label>
          <input
            className={inputClass}
            defaultValue={listing?.title ?? ""}
            id="title"
            name="title"
            placeholder="Ej. Mate termico acero inoxidable 1L"
            required
          />
          <p className={helpClass}>Usa el titulo con el que el equipo reconoce la publicacion en la operacion.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="externalId">
              ID externo
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.externalId ?? ""}
              id="externalId"
              name="externalId"
              placeholder="MLA-..."
            />
            <p className={helpClass}>Sirve para importar CSV o cruzar datos exportados del marketplace.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="sku">
              SKU
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.sku ?? ""}
              id="sku"
              name="sku"
              placeholder="SKU interno"
            />
            <p className={helpClass}>Referencia interna para buscar rapido y evitar confusiones.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Seguimiento operativo</legend>
        <p className="text-xs leading-5 text-muted">
          Estado y valores actuales para contextualizar cambios y snapshots. Las metricas historicas
          se cargan desde Importaciones.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="status">
              Estado
            </label>
            <select
              className={inputClass}
              defaultValue={listing?.status ?? ListingStatus.ACTIVE}
              id="status"
              name="status"
            >
              {listingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {listingStatusLabels[status]}
                </option>
              ))}
            </select>
            <p className={helpClass}>Usalo como estado operativo, no como historial de cambios.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="currentPrice">
              Precio actual
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.currentPrice ?? ""}
              id="currentPrice"
              inputMode="decimal"
              min="0"
              name="currentPrice"
              step="0.01"
              type="number"
            />
            <p className={helpClass}>Numero mayor o igual a cero. Los cambios de precio conviene registrarlos tambien como cambio.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="availableStock">
              Stock
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.availableStock ?? ""}
              id="availableStock"
              inputMode="numeric"
              min="0"
              name="availableStock"
              step="1"
              type="number"
            />
            <p className={helpClass}>Entero mayor o igual a cero. Ayuda a no atribuir caidas a causas equivocadas.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="categoryName">
              Categoria
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.categoryName ?? ""}
              id="categoryName"
              name="categoryName"
              placeholder="Ej. Termos y mates"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="brand">
              Marca
            </label>
            <input
              className={inputClass}
              defaultValue={listing?.brand ?? ""}
              id="brand"
              name="brand"
              placeholder="Marca visible o propia"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Contexto y notas</legend>
        <p className="text-xs leading-5 text-muted">
          Informacion corta para entender sensibilidad a precio, stock, posicionamiento o criterios
          del equipo.
        </p>

        <div>
          <label className={labelClass} htmlFor="permalink">
            Link
          </label>
          <input
            className={inputClass}
            defaultValue={listing?.permalink ?? ""}
            id="permalink"
            name="permalink"
            placeholder="https://articulo.mercadolibre.com.ar/..."
            type="url"
          />
          <p className={helpClass}>Opcional. Debe ser una URL completa si se carga.</p>
        </div>

        <input
          name="marketplace"
          type="hidden"
          value={listing?.marketplace ?? defaultProject?.marketplace ?? "mercado-libre"}
        />

        <div>
          <label className={labelClass} htmlFor="notes">
            Notas operativas
          </label>
          <textarea
            className={`${inputClass} min-h-28`}
            defaultValue={listing?.notes ?? ""}
            id="notes"
            name="notes"
            placeholder="Contexto operativo, sensibilidad a precio, observaciones de equipo."
          />
        </div>
      </fieldset>

      <button
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-muted"
        disabled={projects.length === 0}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
