"use client";

import type { FormEvent } from "react";

import { archiveProject } from "@/lib/market-actions";

type ArchiveProjectFormProps = {
  projectId: string;
  projectName: string;
  returnTo?: string;
  variant?: "button" | "menu";
};

export function ArchiveProjectForm({
  projectId,
  projectName,
  returnTo = "/proyectos?status=ARCHIVED",
  variant = "button",
}: ArchiveProjectFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Archivar "${projectName}"?\n\nConserva publicaciones, cambios e imports, pero lo saca del seguimiento activo.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  const buttonClass =
    variant === "menu"
      ? "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-warning transition hover:bg-warning/10"
      : "rounded-2xl border border-warning/45 px-4 py-2 text-sm font-semibold text-warning transition hover:bg-warning/10";

  return (
    <form action={archiveProject} onSubmit={handleSubmit}>
      <input name="projectId" type="hidden" value={projectId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <button className={buttonClass} type="submit">
        Archivar
      </button>
    </form>
  );
}
