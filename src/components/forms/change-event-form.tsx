import { ChangeEventType } from "@/generated/prisma";
import { toDateTimeInputValue } from "@/lib/format";
import { changeEventTypeLabels, changeEventTypeOptions } from "@/lib/market-labels";

type ListingOption = {
  id: string;
  title: string;
  sku?: string | null;
  externalId?: string | null;
  project: {
    name: string;
  };
};

type ChangeEventFormValues = {
  id?: string;
  listingId?: string;
  occurredAt?: Date;
  type?: ChangeEventType;
  detail?: string;
  previousValue?: string | null;
  newValue?: string | null;
  comment?: string | null;
  actorName?: string | null;
  hypothesis?: string | null;
};

type ChangeEventFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  changeEvent?: ChangeEventFormValues;
  listings: ListingOption[];
  selectedListingId?: string;
  submitLabel: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "text-sm font-semibold text-ink";

export function ChangeEventForm({
  action,
  changeEvent,
  listings,
  selectedListingId,
  submitLabel,
}: ChangeEventFormProps) {
  const defaultListingId = changeEvent?.listingId ?? selectedListingId ?? listings[0]?.id ?? "";
  const defaultOccurredAt = toDateTimeInputValue(changeEvent?.occurredAt ?? new Date());

  return (
    <form action={action} className="space-y-5">
      {changeEvent?.id ? (
        <input type="hidden" name="changeEventId" value={changeEvent.id} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <label className={labelClass} htmlFor="listingId">
            Publicacion
          </label>
          <select
            className={inputClass}
            defaultValue={defaultListingId}
            disabled={listings.length === 0}
            id="listingId"
            name="listingId"
            required
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.project.name} - {listing.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="type">
            Tipo
          </label>
          <select
            className={inputClass}
            defaultValue={changeEvent?.type ?? ChangeEventType.OTHER}
            id="type"
            name="type"
          >
            {changeEventTypeOptions.map((type) => (
              <option key={type} value={type}>
                {changeEventTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="occurredAt">
            Fecha
          </label>
          <input
            className={inputClass}
            defaultValue={defaultOccurredAt}
            id="occurredAt"
            name="occurredAt"
            required
            type="datetime-local"
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="text-sm leading-6 text-amber-700">
          Primero crea una publicacion para registrar cambios operativos.
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="detail">
          Descripcion del cambio
        </label>
        <textarea
          className={`${inputClass} min-h-24`}
          defaultValue={changeEvent?.detail ?? ""}
          id="detail"
          name="detail"
          placeholder="Que se toco y por que conviene recordarlo."
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="previousValue">
            Valor anterior
          </label>
          <input
            className={inputClass}
            defaultValue={changeEvent?.previousValue ?? ""}
            id="previousValue"
            name="previousValue"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="newValue">
            Valor nuevo
          </label>
          <input
            className={inputClass}
            defaultValue={changeEvent?.newValue ?? ""}
            id="newValue"
            name="newValue"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
        <div>
          <label className={labelClass} htmlFor="actorName">
            Responsable
          </label>
          <input
            className={inputClass}
            defaultValue={changeEvent?.actorName ?? ""}
            id="actorName"
            name="actorName"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="hypothesis">
            Hipotesis de trabajo
          </label>
          <input
            className={inputClass}
            defaultValue={changeEvent?.hypothesis ?? ""}
            id="hypothesis"
            name="hypothesis"
            placeholder="Que se esperaba que pasara, sin prometer causalidad."
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="comment">
          Comentario
        </label>
        <textarea
          className={`${inputClass} min-h-24`}
          defaultValue={changeEvent?.comment ?? ""}
          id="comment"
          name="comment"
          placeholder="Contexto observable, criterio usado o aprendizaje inicial."
        />
      </div>

      <button
        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={listings.length === 0}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
