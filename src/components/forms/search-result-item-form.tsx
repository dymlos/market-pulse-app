type ListingOption = {
  id: string;
  title: string;
  externalId: string | null;
};

type CompetitorOption = {
  id: string;
  name: string;
};

type SearchResultItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  snapshotId: string;
  listings: ListingOption[];
  competitors: CompetitorOption[];
  returnTo: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "text-sm font-semibold text-ink";
const checkboxClass = "h-4 w-4 rounded border-line bg-panel-raised text-accent focus:ring-accent";

export function SearchResultItemForm({
  action,
  snapshotId,
  listings,
  competitors,
  returnTo,
}: SearchResultItemFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input name="searchSnapshotId" type="hidden" value={snapshotId} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="grid gap-4 md:grid-cols-[0.5fr_1.5fr_1fr]">
        <div>
          <label className={labelClass} htmlFor="position">
            Posicion
          </label>
          <input className={inputClass} id="position" min={1} name="position" required type="number" />
        </div>

        <div>
          <label className={labelClass} htmlFor="observedTitle">
            Titulo observado
          </label>
          <input
            className={inputClass}
            id="observedTitle"
            name="observedTitle"
            placeholder="Titulo visible en la busqueda"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="observedPrice">
            Precio observado
          </label>
          <input className={inputClass} id="observedPrice" min={0} name="observedPrice" step="0.01" type="number" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ownerType">
            Relacion
          </label>
          <select className={inputClass} defaultValue="unlinked" id="ownerType" name="ownerType">
            <option value="unlinked">Solo observado</option>
            <option value="own">Publicacion propia</option>
            <option value="competitor">Competidor</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="ownListingId">
            Publicacion propia
          </label>
          <select className={inputClass} defaultValue="" id="ownListingId" name="ownListingId">
            <option value="">Sin vincular</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.externalId ? `${listing.externalId} - ${listing.title}` : listing.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="competitorId">
            Competidor existente
          </label>
          <select className={inputClass} defaultValue="" id="competitorId" name="competitorId">
            <option value="">Sin competidor</option>
            {competitors.map((competitor) => (
              <option key={competitor.id} value={competitor.id}>
                {competitor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="newCompetitorName">
            Nuevo competidor
          </label>
          <input
            className={inputClass}
            id="newCompetitorName"
            name="newCompetitorName"
            placeholder="Usar si no existe arriba"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="newCompetitorSellerHandle">
            Seller nuevo
          </label>
          <input
            className={inputClass}
            id="newCompetitorSellerHandle"
            name="newCompetitorSellerHandle"
            placeholder="handle visible"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="observedSellerName">
            Vendedor visible
          </label>
          <input
            className={inputClass}
            id="observedSellerName"
            name="observedSellerName"
            placeholder="Nombre tal como aparece"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="externalListingId">
            ID externo
          </label>
          <input
            className={inputClass}
            id="externalListingId"
            name="externalListingId"
            placeholder="MLA..."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="visibleFlags">
            Flags visibles
          </label>
          <input
            className={inputClass}
            id="visibleFlags"
            name="visibleFlags"
            placeholder="full, envio gratis, promo"
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-line bg-panel-raised p-4 text-sm text-ink md:grid-cols-4">
        <label className="flex items-center gap-2">
          <input className={checkboxClass} name="isSponsored" type="checkbox" />
          Sponsored
        </label>
        <label className="flex items-center gap-2">
          <input className={checkboxClass} name="hasFull" type="checkbox" />
          Full
        </label>
        <label className="flex items-center gap-2">
          <input className={checkboxClass} name="hasFreeShipping" type="checkbox" />
          Envio gratis
        </label>
        <label className="flex items-center gap-2">
          <input className={checkboxClass} name="isCatalogListing" type="checkbox" />
          Catalogo
        </label>
      </div>

      <div>
        <label className={labelClass} htmlFor="resultNotes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-20`}
          id="resultNotes"
          name="notes"
          placeholder="Detalle manual relevante para interpretar este resultado despues."
        />
      </div>

      <button className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90" type="submit">
        Agregar resultado
      </button>
    </form>
  );
}
