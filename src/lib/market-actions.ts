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
import { currencyOptions } from "@/lib/market-labels";
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

function getOptionalNumberField(
  formData: FormData,
  name: string,
  label: string,
  options: { integer?: boolean; min?: number } = {},
) {
  const value = getText(formData, name);
  if (!value) {
    return { value: null, error: null };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${label} debe ser un numero valido.` };
  }

  if (options.min !== undefined && parsed < options.min) {
    return { value: null, error: `${label} no puede ser menor que ${options.min}.` };
  }

  if (options.integer && !Number.isInteger(parsed)) {
    return { value: null, error: `${label} debe ser un numero entero.` };
  }

  return { value: parsed, error: null };
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

function getOptionalUrlField(formData: FormData, name: string, label: string, returnPath: string) {
  const value = getOptionalText(formData, name);
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      redirectWithError(returnPath, `${label} debe ser una URL http o https.`);
    }
  } catch {
    redirectWithError(returnPath, `${label} debe ser una URL valida.`);
  }

  return value;
}

async function ensureActiveProject(projectId: string, returnPath: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true, marketplace: true },
  });

  if (!project) {
    redirectWithError(returnPath, "No se encontro el proyecto seleccionado.");
  }

  if (project.status === ProjectStatus.ARCHIVED) {
    redirectWithError(returnPath, "El proyecto seleccionado está archivado.");
  }

  return project;
}

async function ensureListingExists(listingId: string, returnPath: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });

  if (!listing) {
    redirectWithError(returnPath, "No se encontro la publicacion seleccionada.");
  }

  return listing;
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

function coerceProjectCreationStatus(value: string, returnPath: string) {
  const status = coerceProjectStatus(value);

  if (status === ProjectStatus.ARCHIVED) {
    redirectWithError(returnPath, "Un proyecto nuevo no puede crearse archivado.");
  }

  return status;
}

function coerceCurrencyCode(value: string) {
  const currencyCode = value || "ARS";
  const isKnownCurrency = currencyOptions.some((option) => option.value === currencyCode);
  const isIsoLikeCode = /^[A-Z]{3}$/.test(currencyCode);

  return isKnownCurrency || isIsoLikeCode ? currencyCode : "ARS";
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

const CHANGE_DETAIL_MIN_LENGTH = 8;
const CHANGE_TYPES_WITH_BEFORE_AFTER = new Set<ChangeEventType>([
  ChangeEventType.PRICE_UPDATE,
  ChangeEventType.STOCK_UPDATE,
  ChangeEventType.TITLE_UPDATE,
  ChangeEventType.DESCRIPTION_UPDATE,
  ChangeEventType.PROMOTION_UPDATE,
  ChangeEventType.SHIPPING_UPDATE,
  ChangeEventType.CATALOG_UPDATE,
  ChangeEventType.STATUS_UPDATE,
]);

function buildChangeFormPath(listingId?: string | null) {
  return listingId
    ? `/cambios/nuevo?listingId=${encodeURIComponent(listingId)}`
    : "/cambios/nuevo";
}

function appendQueryParam(path: string, key: string, value: string) {
  const hashIndex = path.indexOf("#");
  const base = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const separator = base.includes("?") ? "&" : "?";

  return `${base}${separator}${key}=${encodeURIComponent(value)}${hash}`;
}

function validateChangeEventFields(input: {
  detail: string;
  occurredAt: Date | null;
  type: ChangeEventType;
  previousValue: string | null;
  newValue: string | null;
  returnPath: string;
}) {
  if (!input.detail) {
    redirectWithError(input.returnPath, "La descripcion del cambio es obligatoria.");
  }

  if (input.detail.length < CHANGE_DETAIL_MIN_LENGTH) {
    redirectWithError(
      input.returnPath,
      `La descripcion del cambio debe tener al menos ${CHANGE_DETAIL_MIN_LENGTH} caracteres.`,
    );
  }

  if (!input.occurredAt) {
    redirectWithError(input.returnPath, "Indica una fecha valida para el cambio.");
  }

  if (input.occurredAt.getTime() > Date.now()) {
    redirectWithError(input.returnPath, "La fecha del cambio no puede estar en el futuro.");
  }

  if (
    CHANGE_TYPES_WITH_BEFORE_AFTER.has(input.type) &&
    Boolean(input.previousValue) !== Boolean(input.newValue)
  ) {
    redirectWithError(
      input.returnPath,
      "Si cargas antes/despues para este tipo de cambio, completa ambos valores.",
    );
  }
}

export async function createProject(formData: FormData) {
  const name = getText(formData, "name");
  const returnPath = "/proyectos/nuevo";

  if (!name) {
    redirectWithError(returnPath, "El nombre del proyecto es obligatorio.");
  }

  if (name.length < 2) {
    redirectWithError(returnPath, "El nombre del proyecto debe tener al menos 2 caracteres.");
  }

  const project = await prisma.project.create({
    data: {
      name,
      slug: await buildUniqueProjectSlug(name),
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      currencyCode: coerceCurrencyCode(getText(formData, "currencyCode")),
      status: coerceProjectCreationStatus(getText(formData, "status"), returnPath),
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${project.id}`);
  redirect(`/proyectos/${project.id}?created=1`);
}

export async function updateProject(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const name = getText(formData, "name");

  if (!projectId) {
    redirectWithError("/proyectos", "No se encontró el proyecto a editar.");
  }

  if (!name) {
    redirectWithError(`/proyectos/${projectId}/editar`, "El nombre del proyecto es obligatorio.");
  }

  if (name.length < 2) {
    redirectWithError(
      `/proyectos/${projectId}/editar`,
      "El nombre del proyecto debe tener al menos 2 caracteres.",
    );
  }

  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true },
  });

  if (!existingProject) {
    redirectWithError("/proyectos", "No se encontró el proyecto a editar.");
  }

  const nextStatus = coerceProjectStatus(getText(formData, "status"));

  if (
    nextStatus === ProjectStatus.ARCHIVED &&
    existingProject.status !== ProjectStatus.ARCHIVED
  ) {
    redirectWithError(
      `/proyectos/${projectId}/editar`,
      "Para archivar el proyecto, usá la acción Archivar con confirmación.",
    );
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      marketplace: getText(formData, "marketplace") || "mercado-libre",
      currencyCode: coerceCurrencyCode(getText(formData, "currencyCode")),
      status: nextStatus,
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${projectId}`);
  redirect(`/proyectos/${projectId}?updated=1`);
}

export async function archiveProject(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo = getReturnPath(formData, "/proyectos");

  if (!projectId) {
    redirectWithError(returnTo, "No se encontró el proyecto a archivar.");
  }

  const result = await prisma.project.updateMany({
    where: {
      id: projectId,
      status: { not: ProjectStatus.ARCHIVED },
    },
    data: {
      status: ProjectStatus.ARCHIVED,
    },
  });

  if (result.count === 0) {
    redirectWithError(returnTo, "No se encontró un proyecto activo para archivar.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${projectId}`);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}archived=1`);
}

export async function createListing(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const title = getText(formData, "title");
  const returnPath = projectId
    ? `/publicaciones/nueva?projectId=${encodeURIComponent(projectId)}`
    : "/publicaciones/nueva";

  if (!projectId) {
    redirectWithError(returnPath, "Selecciona un proyecto para la publicacion.");
  }

  if (!title) {
    redirectWithError(returnPath, "El titulo de la publicacion es obligatorio.");
  }

  const project = await ensureActiveProject(projectId, returnPath);

  const currentPrice = getOptionalNumberField(formData, "currentPrice", "El precio actual", {
    min: 0,
  });
  if (currentPrice.error) {
    redirectWithError(returnPath, currentPrice.error);
  }

  const availableStock = getOptionalNumberField(formData, "availableStock", "El stock", {
    integer: true,
    min: 0,
  });
  if (availableStock.error) {
    redirectWithError(returnPath, availableStock.error);
  }

  const permalink = getOptionalUrlField(formData, "permalink", "El link", returnPath);

  const externalId = getOptionalText(formData, "externalId");
  if (externalId) {
    const duplicated = await prisma.listing.findUnique({
      where: { projectId_externalId: { projectId, externalId } },
    });

    if (duplicated) {
      redirectWithError(
        returnPath,
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
      marketplace: project.marketplace,
      permalink,
      categoryName: getOptionalText(formData, "categoryName"),
      brand: getOptionalText(formData, "brand"),
      currentPrice: currentPrice.value,
      availableStock: availableStock.value,
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/publicaciones");
  redirect(`/publicaciones/${listing.id}?created=1`);
}

export async function updateListing(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const projectId = getText(formData, "projectId");
  const title = getText(formData, "title");
  const returnPath = listingId ? `/publicaciones/${listingId}/editar` : "/publicaciones";

  if (!listingId) {
    redirectWithError("/publicaciones", "No se encontro la publicacion a editar.");
  }

  if (!projectId || !title) {
    redirectWithError(
      returnPath,
      "Proyecto y titulo son obligatorios para guardar la publicacion.",
    );
  }

  await ensureListingExists(listingId, "/publicaciones");
  const project = await ensureActiveProject(projectId, returnPath);

  const currentPrice = getOptionalNumberField(formData, "currentPrice", "El precio actual", {
    min: 0,
  });
  if (currentPrice.error) {
    redirectWithError(returnPath, currentPrice.error);
  }

  const availableStock = getOptionalNumberField(formData, "availableStock", "El stock", {
    integer: true,
    min: 0,
  });
  if (availableStock.error) {
    redirectWithError(returnPath, availableStock.error);
  }

  const permalink = getOptionalUrlField(formData, "permalink", "El link", returnPath);

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
        returnPath,
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
      marketplace: project.marketplace,
      permalink,
      categoryName: getOptionalText(formData, "categoryName"),
      brand: getOptionalText(formData, "brand"),
      currentPrice: currentPrice.value,
      availableStock: availableStock.value,
      notes: getOptionalText(formData, "notes"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/publicaciones");
  revalidatePath(`/publicaciones/${listingId}`);
  redirect(`/publicaciones/${listingId}?updated=1`);
}

export async function createChangeEvent(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const detail = getText(formData, "detail");
  const occurredAt = parseOccurredAt(getText(formData, "occurredAt"));
  const type = coerceChangeEventType(getText(formData, "type"));
  const previousValue = getOptionalText(formData, "previousValue");
  const newValue = getOptionalText(formData, "newValue");
  const returnPath = buildChangeFormPath(listingId);
  const returnTo = getReturnPath(formData, "");

  if (!listingId) {
    redirectWithError(returnPath, "Selecciona una publicacion para registrar el cambio.");
  }

  validateChangeEventFields({
    detail,
    occurredAt,
    type,
    previousValue,
    newValue,
    returnPath,
  });
  if (!occurredAt) {
    redirectWithError(returnPath, "Indica una fecha valida para el cambio.");
  }

  await ensureListingExists(listingId, returnPath);

  const changeEvent = await prisma.changeEvent.create({
    data: {
      listingId,
      occurredAt,
      type,
      detail,
      previousValue,
      newValue,
      comment: getOptionalText(formData, "comment"),
      actorName: getOptionalText(formData, "actorName"),
      hypothesis: getOptionalText(formData, "hypothesis"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cambios");
  revalidatePath(`/publicaciones/${listingId}`);

  if (returnTo) {
    redirect(appendQueryParam(returnTo, "change", "created"));
  }

  redirect(`/cambios/${changeEvent.id}`);
}

export async function updateChangeEvent(formData: FormData) {
  const changeEventId = getText(formData, "changeEventId");
  const listingId = getText(formData, "listingId");
  const detail = getText(formData, "detail");
  const occurredAt = parseOccurredAt(getText(formData, "occurredAt"));
  const type = coerceChangeEventType(getText(formData, "type"));
  const previousValue = getOptionalText(formData, "previousValue");
  const newValue = getOptionalText(formData, "newValue");
  const returnPath = changeEventId ? `/cambios/${changeEventId}/editar` : "/cambios";

  if (!changeEventId) {
    redirectWithError("/cambios", "No se encontro el cambio a editar.");
  }

  if (!listingId) {
    redirectWithError(returnPath, "Selecciona una publicacion para guardar el cambio.");
  }

  validateChangeEventFields({
    detail,
    occurredAt,
    type,
    previousValue,
    newValue,
    returnPath,
  });
  if (!occurredAt) {
    redirectWithError(returnPath, "Indica una fecha valida para el cambio.");
  }

  const existingChange = await prisma.changeEvent.findUnique({
    where: { id: changeEventId },
    select: { id: true, listingId: true },
  });

  if (!existingChange) {
    redirectWithError("/cambios", "No se encontro el cambio a editar.");
  }

  await ensureListingExists(listingId, `/cambios/${changeEventId}/editar`);

  await prisma.changeEvent.update({
    where: { id: changeEventId },
    data: {
      listingId,
      occurredAt,
      type,
      detail,
      previousValue,
      newValue,
      comment: getOptionalText(formData, "comment"),
      actorName: getOptionalText(formData, "actorName"),
      hypothesis: getOptionalText(formData, "hypothesis"),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cambios");
  revalidatePath(`/cambios/${changeEventId}`);
  if (existingChange.listingId !== listingId) {
    revalidatePath(`/publicaciones/${existingChange.listingId}`);
  }
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

  await ensureActiveProject(projectId, "/competencia/nueva");

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

  const existingSearch = await prisma.trackedSearch.findUnique({
    where: { id: trackedSearchId },
    select: { id: true },
  });

  if (!existingSearch) {
    redirectWithError("/competencia", "No se encontro la busqueda a editar.");
  }

  await ensureActiveProject(projectId, `/competencia/${trackedSearchId}/editar`);

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

  await ensureActiveProject(projectId, returnTo);

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

  const trackedSearch = await prisma.trackedSearch.findUnique({
    where: { id: trackedSearchId },
    select: { id: true },
  });

  if (!trackedSearch) {
    redirectWithError("/competencia", "No se encontro la busqueda monitoreada.");
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
  const positionField = getOptionalNumberField(formData, "position", "La posicion observada", {
    integer: true,
    min: 1,
  });
  const observedTitle = getText(formData, "observedTitle");

  if (positionField.error || positionField.value === null) {
    redirectWithError(
      returnTo,
      positionField.error ?? "La posicion observada debe ser un entero mayor a cero.",
    );
  }

  if (!observedTitle) {
    redirectWithError(returnTo, "El titulo observado es obligatorio.");
  }

  const position = positionField.value;
  const observedPrice = getOptionalNumberField(
    formData,
    "observedPrice",
    "El precio observado",
    { min: 0 },
  );
  if (observedPrice.error) {
    redirectWithError(returnTo, observedPrice.error);
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
      observedPrice: observedPrice.value,
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

  const result = await prisma.opportunitySignal.updateMany({
    where: { id: opportunitySignalId },
    data: {
      status: coerceOpportunityStatus(getText(formData, "status")),
    },
  });

  if (result.count === 0) {
    redirectWithError(returnTo, "No se encontro la senal a actualizar.");
  }

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
