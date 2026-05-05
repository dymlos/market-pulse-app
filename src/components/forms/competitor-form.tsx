type ProjectOption = {
  id: string;
  name: string;
};

type CompetitorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  selectedProjectId?: string;
  returnTo?: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:bg-panel disabled:text-muted";
const labelClass = "text-sm font-semibold text-ink";

export function CompetitorForm({
  action,
  projects,
  selectedProjectId,
  returnTo = "/competencia",
}: CompetitorFormProps) {
  const defaultProjectId = selectedProjectId ?? projects[0]?.id ?? "";

  return (
    <form action={action} className="space-y-4">
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr_1fr]">
        <div>
          <label className={labelClass} htmlFor="competitorProjectId">
            Proyecto
          </label>
          <select
            className={inputClass}
            defaultValue={defaultProjectId}
            disabled={projects.length === 0}
            id="competitorProjectId"
            name="projectId"
            required
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="competitorName">
            Nombre
          </label>
          <input
            className={inputClass}
            id="competitorName"
            name="name"
            placeholder="Outdoor North"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="sellerHandle">
            Seller visible
          </label>
          <input
            className={inputClass}
            id="sellerHandle"
            name="sellerHandle"
            placeholder="outdoornorth"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="marketplaceSellerId">
            ID marketplace
          </label>
          <input
            className={inputClass}
            id="marketplaceSellerId"
            name="marketplaceSellerId"
            placeholder="seller-1001"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="competitorNotes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-20`}
          id="competitorNotes"
          name="notes"
          placeholder="Referencia operativa para reconocerlo en snapshots manuales."
        />
      </div>

      <button
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-muted"
        disabled={projects.length === 0}
        type="submit"
      >
        Crear competidor
      </button>
    </form>
  );
}
