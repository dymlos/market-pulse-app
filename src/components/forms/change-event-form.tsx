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
  returnTo?: string;
  selectedListingId?: string;
  submitLabel: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:bg-panel disabled:text-muted";
const labelClass = "text-sm font-semibold text-ink";
const helpClass = "mt-2 text-xs leading-5 text-muted";
const groupClass = "space-y-4 rounded-2xl border border-line bg-panel/50 p-4";
const futureGuard = toDateTimeInputValue(new Date());

const changeTypeHelp: Partial<Record<ChangeEventType, string>> = {
  PRICE_UPDATE: "Anota precio anterior y nuevo para entender si el cambio movio ventas, conversion o posicion.",
  STOCK_UPDATE: "Registra stock anterior y nuevo para no confundir falta de disponibilidad con baja demanda.",
  TITLE_UPDATE: "Guarda el titulo anterior y el nuevo si el ajuste puede afectar busqueda o conversion.",
  SHIPPING_UPDATE: "Aclara si cambio envio gratis, full, tiempos o costo visible.",
  ADS_UPDATE: "Deja monto, pausa, activacion o foco de campania si eso puede explicar el resultado posterior.",
  STATUS_UPDATE: "Indica si la publicacion se pauso, activo, finalizo o volvio a estar disponible.",
};

const beforeAfterExamples = [
  "Precio: $69.990 -> $67.990",
  "Stock: 8 -> 15",
  "Envio: sin gratis -> envio gratis",
  "Titulo: version anterior -> version nueva",
];

export function ChangeEventForm({
  action,
  changeEvent,
  listings,
  returnTo,
  selectedListingId,
  submitLabel,
}: ChangeEventFormProps) {
  const defaultListingId = changeEvent?.listingId ?? selectedListingId ?? listings[0]?.id ?? "";
  const defaultOccurredAt = toDateTimeInputValue(changeEvent?.occurredAt ?? new Date());
  const selectedType = changeEvent?.type ?? ChangeEventType.OTHER;

  return (
    <form action={action} className="max-w-6xl space-y-5">
      {changeEvent?.id ? (
        <input type="hidden" name="changeEventId" value={changeEvent.id} />
      ) : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Cambio registrado</legend>
        <p className="text-xs leading-5 text-muted">
          Este registro es memoria operativa: que se toco, cuando, sobre que publicacion y con que criterio.
        </p>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <label className={labelClass} htmlFor="listingId">
              Publicacion *
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
            <p className={listings.length === 0 ? "mt-2 text-sm leading-6 text-warning" : helpClass}>
              {listings.length === 0
                ? "Primero crea una publicacion para registrar cambios operativos."
                : "El cambio aparecera en el analisis y en el timeline causal de esta publicacion."}
            </p>
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
            <p className={helpClass}>
              {changeTypeHelp[selectedType] ??
                "Elegí el tipo que mejor represente la accion; si no encaja, usa Otro."}
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="occurredAt">
              Fecha *
            </label>
            <input
              className={inputClass}
              defaultValue={defaultOccurredAt}
              id="occurredAt"
              max={futureGuard}
              name="occurredAt"
              required
              type="datetime-local"
            />
            <p className={helpClass}>No puede quedar en el futuro: la bitacora registra hechos ya realizados.</p>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="detail">
            Descripcion del cambio *
          </label>
          <textarea
            className={`${inputClass} min-h-24`}
            defaultValue={changeEvent?.detail ?? ""}
            id="detail"
            minLength={8}
            name="detail"
            placeholder="Ej. Bajamos precio para cerrar brecha frente a competidores visibles."
            required
          />
          <p className={helpClass}>
            Minimo 8 caracteres. Escribilo como bitacora: accion concreta, criterio y alcance.
          </p>
        </div>
      </fieldset>

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Antes y despues</legend>
        <p className="text-xs leading-5 text-muted">
          Valores opcionales, pero muy utiles para cambios de precio, stock, titulo, envio, promo o estado.
        </p>

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
              placeholder="Ej. $69.990, stock 8, sin envio gratis"
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
              placeholder="Ej. $67.990, stock 15, envio gratis activo"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {beforeAfterExamples.map((example) => (
            <span key={example} className="rounded-full border border-line bg-panel-raised px-3 py-1">
              {example}
            </span>
          ))}
        </div>
      </fieldset>

      <fieldset className={groupClass}>
        <legend className="text-sm font-semibold text-ink">Hipotesis y contexto</legend>
        <p className="text-xs leading-5 text-muted">
          Guardar la intencion ayuda a revisar despues si el resultado acompano, quedo mixto o no fue concluyente.
        </p>

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
              placeholder="Nombre, equipo o canal de decision"
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
              placeholder="Ej. Esperabamos recuperar conversion sin perder margen de forma marcada."
            />
            <p className={helpClass}>Usa lenguaje prudente: esperabamos, queriamos probar, podia ayudar a.</p>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="comment">
            Comentario operativo
          </label>
          <textarea
            className={`${inputClass} min-h-24`}
            defaultValue={changeEvent?.comment ?? ""}
            id="comment"
            name="comment"
            placeholder="Ej. Competidor directo habia bajado precio y el stock propio estaba disponible."
          />
        </div>
      </fieldset>

      <button
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-muted"
        disabled={listings.length === 0}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
