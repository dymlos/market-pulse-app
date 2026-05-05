type ProjectOption = {
  id: string;
  name: string;
};

type TrackedSearchFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  selectedProjectId?: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:bg-panel disabled:text-muted";
const labelClass = "text-sm font-semibold text-ink";

export function TrackedSearchForm({
  action,
  projects,
  selectedProjectId,
}: TrackedSearchFormProps) {
  const defaultProjectId = selectedProjectId ?? projects[0]?.id ?? "";

  return (
    <form action={action} className="space-y-5">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Nombre interno
          </label>
          <input
            className={inputClass}
            id="name"
            name="name"
            placeholder="Mates termicos 1 litro"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="query">
            Busqueda
          </label>
          <input
            className={inputClass}
            id="query"
            name="query"
            placeholder="mate termico acero inoxidable 1 litro"
            required
          />
        </div>
      </div>

      <input name="marketplace" type="hidden" value="mercado-libre" />
      <input name="isActive" type="hidden" value="true" />

      <div>
        <label className={labelClass} htmlFor="notes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-28`}
          id="notes"
          name="notes"
          placeholder="Por que se monitorea esta busqueda y que publicaciones propias conviene observar."
        />
      </div>

      <button
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-muted"
        disabled={projects.length === 0}
        type="submit"
      >
        Crear busqueda
      </button>
    </form>
  );
}
