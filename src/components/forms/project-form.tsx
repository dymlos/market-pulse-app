import { ProjectStatus } from "@/generated/prisma";
import { projectStatusLabels, projectStatusOptions } from "@/lib/market-labels";

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
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15";
const labelClass = "text-sm font-semibold text-ink";

export function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  return (
    <form action={action} className="space-y-5">
      {project?.id ? <input type="hidden" name="projectId" value={project.id} /> : null}

      <div>
        <label className={labelClass} htmlFor="name">
          Nombre
        </label>
        <input
          className={inputClass}
          defaultValue={project?.name ?? ""}
          id="name"
          name="name"
          placeholder="Tienda Andina Outdoor"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="marketplace">
            Marketplace
          </label>
          <input
            className={inputClass}
            defaultValue={project?.marketplace ?? "mercado-libre"}
            id="marketplace"
            name="marketplace"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="currencyCode">
            Moneda
          </label>
          <input
            className={inputClass}
            defaultValue={project?.currencyCode ?? "ARS"}
            id="currencyCode"
            maxLength={3}
            name="currencyCode"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="status">
            Estado
          </label>
          <select
            className={inputClass}
            defaultValue={project?.status ?? ProjectStatus.ACTIVE}
            id="status"
            name="status"
          >
            {projectStatusOptions.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Notas
        </label>
        <textarea
          className={`${inputClass} min-h-28`}
          defaultValue={project?.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Objetivo operativo, cuenta, marca o contexto que convenga recordar."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
