import { SearchSnapshotSource } from "@/generated/prisma";
import { searchSnapshotSourceLabels } from "@/lib/market-labels";

type SearchSnapshotFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  trackedSearchId: string;
  returnTo: string;
  defaultCapturedAt: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "text-sm font-semibold text-ink";

export function SearchSnapshotForm({
  action,
  trackedSearchId,
  returnTo,
  defaultCapturedAt,
}: SearchSnapshotFormProps) {
  return (
    <form action={action} className="space-y-4">
      <input name="trackedSearchId" type="hidden" value={trackedSearchId} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="capturedAt">
            Fecha del snapshot
          </label>
          <input
            className={inputClass}
            defaultValue={defaultCapturedAt}
            id="capturedAt"
            name="capturedAt"
            required
            type="datetime-local"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="source">
            Fuente
          </label>
          <select className={inputClass} defaultValue={SearchSnapshotSource.MANUAL} id="source" name="source">
            {Object.values(SearchSnapshotSource).map((source) => (
              <option key={source} value={source}>
                {searchSnapshotSourceLabels[source]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="snapshotNotes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-24`}
          id="snapshotNotes"
          name="notes"
          placeholder="Contexto de captura: filtros usados, pagina observada, cambios visibles o dudas."
        />
      </div>

      <button className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90" type="submit">
        Crear snapshot
      </button>
    </form>
  );
}
