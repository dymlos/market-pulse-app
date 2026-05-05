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

export function ListingForm({
  action,
  listing,
  projects,
  selectedProjectId,
  submitLabel,
}: ListingFormProps) {
  const defaultProjectId = listing?.projectId ?? selectedProjectId ?? projects[0]?.id ?? "";

  return (
    <form action={action} className="space-y-5">
      {listing?.id ? <input type="hidden" name="listingId" value={listing.id} /> : null}

      <div>
        <label className={labelClass} htmlFor="projectId">
          Proyecto
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
        {projects.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-warning">
            Primero crea un proyecto activo para cargar publicaciones.
          </p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          Titulo de la publicacion
        </label>
        <input
          className={inputClass}
          defaultValue={listing?.title ?? ""}
          id="title"
          name="title"
          placeholder="Mate termico acero inoxidable 1L"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        </div>

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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className={labelClass} htmlFor="currentPrice">
            Precio actual
          </label>
          <input
            className={inputClass}
            defaultValue={listing?.currentPrice ?? ""}
            id="currentPrice"
            min="0"
            name="currentPrice"
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="availableStock">
            Stock
          </label>
          <input
            className={inputClass}
            defaultValue={listing?.availableStock ?? ""}
            id="availableStock"
            min="0"
            name="availableStock"
            step="1"
            type="number"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="categoryName">
            Categoria
          </label>
          <input
            className={inputClass}
            defaultValue={listing?.categoryName ?? ""}
            id="categoryName"
            name="categoryName"
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
          />
        </div>
      </div>

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
      </div>

      <input name="marketplace" type="hidden" value={listing?.marketplace ?? "mercado-libre"} />

      <div>
        <label className={labelClass} htmlFor="notes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-28`}
          defaultValue={listing?.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Contexto operativo, sensibilidad a precio, observaciones de equipo."
        />
      </div>

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
