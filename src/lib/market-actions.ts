"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ChangeEventType, ListingStatus, ProjectStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalText(formData: FormData, name: string) {
  const value = getText(formData, name);
  return value.length > 0 ? value : null;
}

function getOptionalNumber(formData: FormData, name: string) {
  const value = getText(formData, name);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getOptionalInteger(formData: FormData, name: string) {
  const parsed = getOptionalNumber(formData, name);
  return parsed === null ? null : Math.trunc(parsed);
}

function redirectWithError(path: string, message: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}error=${encodeURIComponent(message)}`);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

async function buildUniqueProjectSlug(name: string) {
  const baseSlug = slugify(name) || "proyecto";
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function coerceProjectStatus(value: string) {
  return Object.values(ProjectStatus).includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : ProjectStatus.ACTIVE;
}

function coerceListingStatus(value: string) {
  return Object.values(ListingStatus).includes(value as ListingStatus)
    ? (value as ListingStatus)
    : ListingStatus.ACTIVE;
}

function coerceChangeEventType(value: string) {
  return Object.values(ChangeEventType).includes(value as ChangeEventType)
    ? (value as ChangeEventType)
    : ChangeEventType.OTHER;
}

function parseOccurredAt(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createProject(formData: FormData) {
  const name = getText(formData, "name");

  if (!name) {
    redirectWithError("/proyectos/nuevo", "El nombre del proyecto es obligatorio.");
  }

  const project = await prisma.project.create({
    data: {
      name,
      slug: await buildUniqueProjectSlug(name),
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      currencyCode: getText(formData, "currencyCode") || "ARS",
      status: coerceProjectStatus(getText(formData, "status")),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  redirect(`/proyectos?created=${project.id}`);
}

export async function updateProject(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const name = getText(formData, "name");

  if (!projectId) {
    redirectWithError("/proyectos", "No se encontro el proyecto a editar.");
  }

  if (!name) {
    redirectWithError(`/proyectos/${projectId}/editar`, "El nombre del proyecto es obligatorio.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      currencyCode: getText(formData, "currencyCode") || "ARS",
      status: coerceProjectStatus(getText(formData, "status")),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  redirect("/proyectos?updated=1");
}

export async function archiveProject(formData: FormData) {
  const projectId = getText(formData, "projectId");

  if (!projectId) {
    redirectWithError("/proyectos", "No se encontro el proyecto a archivar.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.ARCHIVED },
  });

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  redirect("/proyectos?archived=1");
}

export async function createListing(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const title = getText(formData, "title");

  if (!projectId) {
    redirectWithError("/publicaciones/nueva", "Selecciona un proyecto para la publicacion.");
  }

  if (!title) {
    redirectWithError("/publicaciones/nueva", "El titulo de la publicacion es obligatorio.");
  }

  const externalId = getOptionalText(formData, "externalId");
  if (externalId) {
    const duplicated = await prisma.listing.findUnique({
      where: { projectId_externalId: { projectId, externalId } },
    });

    if (duplicated) {
      redirectWithError(
        "/publicaciones/nueva",
        "Ya existe una publicacion con ese ID externo dentro del proyecto.",
      );
    }
  }

  const listing = await prisma.listing.create({
    data: {
      projectId,
      title,
      externalId,
      sku: getOptionalText(formData, "sku"),
      status: coerceListingStatus(getText(formData, "status")),
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      permalink: getOptionalText(formData, "permalink"),
      categoryName: getOptionalText(formData, "categoryName"),
      brand: getOptionalText(formData, "brand"),
      currentPrice: getOptionalNumber(formData, "currentPrice"),
      availableStock: getOptionalInteger(formData, "availableStock"),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/publicaciones");
  redirect(`/publicaciones/${listing.id}`);
}

export async function updateListing(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const projectId = getText(formData, "projectId");
  const title = getText(formData, "title");

  if (!listingId) {
    redirectWithError("/publicaciones", "No se encontro la publicacion a editar.");
  }

  if (!projectId || !title) {
    redirectWithError(
      `/publicaciones/${listingId}/editar`,
      "Proyecto y titulo son obligatorios para guardar la publicacion.",
    );
  }

  const externalId = getOptionalText(formData, "externalId");
  if (externalId) {
    const duplicated = await prisma.listing.findFirst({
      where: {
        projectId,
        externalId,
        id: { not: listingId },
      },
    });

    if (duplicated) {
      redirectWithError(
        `/publicaciones/${listingId}/editar`,
        "Ya existe otra publicacion con ese ID externo dentro del proyecto.",
      );
    }
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      projectId,
      title,
      externalId,
      sku: getOptionalText(formData, "sku"),
      status: coerceListingStatus(getText(formData, "status")),
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      permalink: getOptionalText(formData, "permalink"),
      categoryName: getOptionalText(formData, "categoryName"),
      brand: getOptionalText(formData, "brand"),
      currentPrice: getOptionalNumber(formData, "currentPrice"),
      availableStock: getOptionalInteger(formData, "availableStock"),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/publicaciones");
  revalidatePath(`/publicaciones/${listingId}`);
  redirect(`/publicaciones/${listingId}`);
}

export async function createChangeEvent(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const detail = getText(formData, "detail");
  const occurredAt = parseOccurredAt(getText(formData, "occurredAt"));

  if (!listingId) {
    redirectWithError("/cambios/nuevo", "Selecciona una publicacion para registrar el cambio.");
  }

  if (!detail) {
    redirectWithError("/cambios/nuevo", "La descripcion del cambio es obligatoria.");
  }

  if (!occurredAt) {
    redirectWithError("/cambios/nuevo", "Indica una fecha valida para el cambio.");
  }

  const changeEvent = await prisma.changeEvent.create({
    data: {
      listingId,
      occurredAt,
      type: coerceChangeEventType(getText(formData, "type")),
      detail,
      previousValue: getOptionalText(formData, "previousValue"),
      newValue: getOptionalText(formData, "newValue"),
      comment: getOptionalText(formData, "comment"),
      actorName: getOptionalText(formData, "actorName"),
      hypothesis: getOptionalText(formData, "hypothesis"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cambios");
  revalidatePath(`/publicaciones/${listingId}`);
  redirect(`/cambios/${changeEvent.id}`);
}

export async function updateChangeEvent(formData: FormData) {
  const changeEventId = getText(formData, "changeEventId");
  const listingId = getText(formData, "listingId");
  const detail = getText(formData, "detail");
  const occurredAt = parseOccurredAt(getText(formData, "occurredAt"));

  if (!changeEventId) {
    redirectWithError("/cambios", "No se encontro el cambio a editar.");
  }

  if (!listingId || !detail || !occurredAt) {
    redirectWithError(
      `/cambios/${changeEventId}/editar`,
      "Publicacion, descripcion y fecha son obligatorias.",
    );
  }

  await prisma.changeEvent.update({
    where: { id: changeEventId },
    data: {
      listingId,
      occurredAt,
      type: coerceChangeEventType(getText(formData, "type")),
      detail,
      previousValue: getOptionalText(formData, "previousValue"),
      newValue: getOptionalText(formData, "newValue"),
      comment: getOptionalText(formData, "comment"),
      actorName: getOptionalText(formData, "actorName"),
      hypothesis: getOptionalText(formData, "hypothesis"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cambios");
  revalidatePath(`/cambios/${changeEventId}`);
  revalidatePath(`/publicaciones/${listingId}`);
  redirect(`/cambios/${changeEventId}`);
}

export async function createTrackedSearch(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const name = getText(formData, "name");
  const query = getText(formData, "query");

  if (!projectId || !name || !query) {
    redirectWithError(
      "/competencia/nueva",
      "Proyecto, nombre y busqueda son obligatorios para monitorear una busqueda.",
    );
  }

  const trackedSearch = await prisma.trackedSearch.create({
    data: {
      projectId,
      name,
      query,
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      isActive: getText(formData, "isActive") !== "false",
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/competencia");
  redirect(`/competencia/${trackedSearch.id}`);
}
