"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ChangeEventType,
  ListingStatus,
  OpportunityStatus,
  ProjectStatus,
  SearchSnapshotSource,
} from "@/generated/prisma";
import { detectAndPersistOpportunitySignals } from "@/lib/opportunity-service";
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

function getBoolean(formData: FormData, name: string) {
  const value = getText(formData, name);
  return value === "true" || value === "on" || value === "1";
}

function getReturnPath(formData: FormData, fallback: string) {
  const value = getText(formData, "returnTo");
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
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

function coerceSearchSnapshotSource(value: string) {
  return Object.values(SearchSnapshotSource).includes(value as SearchSnapshotSource)
    ? (value as SearchSnapshotSource)
    : SearchSnapshotSource.MANUAL;
}

function coerceOpportunityStatus(value: string) {
  return Object.values(OpportunityStatus).includes(value as OpportunityStatus)
    ? (value as OpportunityStatus)
    : OpportunityStatus.NEW;
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

export async function updateTrackedSearch(formData: FormData) {
  const trackedSearchId = getText(formData, "trackedSearchId");
  const projectId = getText(formData, "projectId");
  const name = getText(formData, "name");
  const query = getText(formData, "query");

  if (!trackedSearchId) {
    redirectWithError("/competencia", "No se encontro la busqueda a editar.");
  }

  if (!projectId || !name || !query) {
    redirectWithError(
      `/competencia/${trackedSearchId}/editar`,
      "Proyecto, nombre y busqueda son obligatorios.",
    );
  }

  await prisma.trackedSearch.update({
    where: { id: trackedSearchId },
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
  revalidatePath(`/competencia/${trackedSearchId}`);
  redirect(`/competencia/${trackedSearchId}`);
}

export async function createCompetitor(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const name = getText(formData, "name");
  const returnTo = getReturnPath(formData, "/competencia");

  if (!projectId || !name) {
    redirectWithError(returnTo, "Proyecto y nombre son obligatorios para crear un competidor.");
  }

  const existing = await findCompetitorByName(projectId, name);

  if (existing) {
    revalidatePath("/competencia");
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}competitor=${existing.id}`);
  }

  const competitor = await prisma.competitor.create({
    data: {
      projectId,
      name,
      sellerHandle: getOptionalText(formData, "sellerHandle"),
      marketplaceSellerId: getOptionalText(formData, "marketplaceSellerId"),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/competencia");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}competitor=${competitor.id}`);
}

export async function createSearchSnapshot(formData: FormData) {
  const trackedSearchId = getText(formData, "trackedSearchId");
  const capturedAt = parseOccurredAt(getText(formData, "capturedAt"));
  const returnTo = getReturnPath(formData, trackedSearchId ? `/competencia/${trackedSearchId}` : "/competencia");

  if (!trackedSearchId) {
    redirectWithError("/competencia", "No se encontro la busqueda monitoreada.");
  }

  if (!capturedAt) {
    redirectWithError(returnTo, "Indica una fecha valida para el snapshot.");
  }

  const duplicate = await prisma.searchSnapshot.findUnique({
    where: {
      trackedSearchId_capturedAt: {
        trackedSearchId,
        capturedAt,
      },
    },
  });

  if (duplicate) {
    redirectWithError(returnTo, "Ya existe un snapshot para esa busqueda y fecha.");
  }

  const snapshot = await prisma.searchSnapshot.create({
    data: {
      trackedSearchId,
      capturedAt,
      source: coerceSearchSnapshotSource(getText(formData, "source")),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/competencia");
  revalidatePath(`/competencia/${trackedSearchId}`);
  redirect(`/competencia/${trackedSearchId}/snapshots/${snapshot.id}`);
}

export async function createSearchResultItem(formData: FormData) {
  const snapshotId = getText(formData, "searchSnapshotId");

  if (!snapshotId) {
    redirectWithError("/competencia", "No se encontro el snapshot para cargar el resultado.");
  }

  const snapshot = await prisma.searchSnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      trackedSearch: true,
    },
  });

  if (!snapshot) {
    redirectWithError("/competencia", "No se encontro el snapshot para cargar el resultado.");
  }

  const returnTo = getReturnPath(
    formData,
    `/competencia/${snapshot.trackedSearchId}/snapshots/${snapshot.id}`,
  );
  const position = getOptionalInteger(formData, "position");
  const observedTitle = getText(formData, "observedTitle");

  if (!position || position < 1) {
    redirectWithError(returnTo, "La posicion observada debe ser un entero mayor a cero.");
  }

  if (!observedTitle) {
    redirectWithError(returnTo, "El titulo observado es obligatorio.");
  }

  const positionTaken = await prisma.searchResultItem.findUnique({
    where: {
      searchSnapshotId_position: {
        searchSnapshotId: snapshot.id,
        position,
      },
    },
  });

  if (positionTaken) {
    redirectWithError(returnTo, "Ya hay un resultado cargado en esa posicion.");
  }

  const ownerType = getText(formData, "ownerType") || "unlinked";
  const ownListingId = ownerType === "own" ? getOptionalText(formData, "ownListingId") : null;
  let competitorId = ownerType === "competitor" ? getOptionalText(formData, "competitorId") : null;
  let observedSellerName = getOptionalText(formData, "observedSellerName");

  if (ownerType === "own" && !ownListingId) {
    redirectWithError(returnTo, "Selecciona la publicacion propia asociada al resultado.");
  }

  if (ownListingId) {
    const listing = await prisma.listing.findFirst({
      where: {
        id: ownListingId,
        projectId: snapshot.trackedSearch.projectId,
      },
    });

    if (!listing) {
      redirectWithError(returnTo, "La publicacion propia no pertenece al proyecto de la busqueda.");
    }

    observedSellerName ??= "Publicacion propia";
  }

  if (ownerType === "competitor" && !competitorId) {
    const newCompetitorName = getOptionalText(formData, "newCompetitorName");
    if (!newCompetitorName) {
      redirectWithError(returnTo, "Selecciona un competidor existente o carga uno nuevo.");
    }

    const existing = await findCompetitorByName(snapshot.trackedSearch.projectId, newCompetitorName);
    const competitor =
      existing ??
      (await prisma.competitor.create({
        data: {
          projectId: snapshot.trackedSearch.projectId,
          name: newCompetitorName,
          sellerHandle: getOptionalText(formData, "newCompetitorSellerHandle"),
        },
      }));

    competitorId = competitor.id;
    observedSellerName ??= competitor.name;
  }

  if (competitorId) {
    const competitor = await prisma.competitor.findFirst({
      where: {
        id: competitorId,
        projectId: snapshot.trackedSearch.projectId,
      },
    });

    if (!competitor) {
      redirectWithError(returnTo, "El competidor no pertenece al proyecto de la busqueda.");
    }

    observedSellerName ??= competitor.name;
  }

  await prisma.searchResultItem.create({
    data: {
      searchSnapshotId: snapshot.id,
      competitorId,
      ownListingId,
      position,
      externalListingId: getOptionalText(formData, "externalListingId"),
      observedTitle,
      observedPrice: getOptionalNumber(formData, "observedPrice"),
      observedSellerName,
      visibleFlags: getOptionalText(formData, "visibleFlags"),
      isOwnListing: ownerType === "own",
      isSponsored: getBoolean(formData, "isSponsored"),
      hasFreeShipping: getBoolean(formData, "hasFreeShipping"),
      hasFull: getBoolean(formData, "hasFull"),
      isCatalogListing: getBoolean(formData, "isCatalogListing"),
      notes: getOptionalText(formData, "notes"),
    },
  });

  const resultsCount = await prisma.searchResultItem.count({
    where: { searchSnapshotId: snapshot.id },
  });

  await prisma.searchSnapshot.update({
    where: { id: snapshot.id },
    data: { resultsCount },
  });

  revalidatePath("/competencia");
  revalidatePath(`/competencia/${snapshot.trackedSearchId}`);
  revalidatePath(`/competencia/${snapshot.trackedSearchId}/snapshots/${snapshot.id}`);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}result=created`);
}

export async function detectOpportunitySignalsAction(formData: FormData) {
  const projectId = getOptionalText(formData, "projectId") ?? undefined;
  const returnTo = getReturnPath(formData, projectId ? `/oportunidades?projectId=${projectId}` : "/oportunidades");
  const result = await detectAndPersistOpportunitySignals({ projectId });

  revalidatePath("/dashboard");
  revalidatePath("/oportunidades");
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}generated=${result.createdCount}&candidates=${result.candidateCount}&existing=${result.existingCount}`,
  );
}

export async function updateOpportunitySignalStatus(formData: FormData) {
  const opportunitySignalId = getText(formData, "opportunitySignalId");
  const returnTo = getReturnPath(formData, "/oportunidades");

  if (!opportunitySignalId) {
    redirectWithError(returnTo, "No se encontro la senal a actualizar.");
  }

  await prisma.opportunitySignal.update({
    where: { id: opportunitySignalId },
    data: {
      status: coerceOpportunityStatus(getText(formData, "status")),
    },
  });

  revalidatePath("/oportunidades");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}updated=1`);
}

async function findCompetitorByName(projectId: string, name: string) {
  const normalizedName = normalizeLookup(name);
  const competitors = await prisma.competitor.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
    },
  });

  return competitors.find((competitor) => normalizeLookup(competitor.name) === normalizedName) ?? null;
}

function normalizeLookup(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
