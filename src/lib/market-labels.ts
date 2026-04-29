import {
  ChangeEventType,
  ListingStatus,
  ProjectStatus,
  SearchSnapshotSource,
} from "@/generated/prisma";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  ARCHIVED: "Archivado",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  DRAFT: "Borrador",
  ENDED: "Finalizada",
  ARCHIVED: "Archivada",
};

export const changeEventTypeLabels: Record<ChangeEventType, string> = {
  PRICE_UPDATE: "Precio",
  TITLE_UPDATE: "Titulo",
  IMAGE_UPDATE: "Imagenes",
  DESCRIPTION_UPDATE: "Descripcion",
  PROMOTION_UPDATE: "Promocion",
  STOCK_UPDATE: "Stock",
  ADS_UPDATE: "Ads",
  SHIPPING_UPDATE: "Envio",
  CATALOG_UPDATE: "Catalogo",
  STATUS_UPDATE: "Estado",
  OTHER: "Otro",
};

export const searchSnapshotSourceLabels: Record<SearchSnapshotSource, string> = {
  MANUAL: "Manual",
  CSV: "CSV",
  SEMI_MANUAL: "Semi-manual",
  OTHER: "Otro",
};

export const projectStatusOptions = Object.values(ProjectStatus);
export const listingStatusOptions = Object.values(ListingStatus);
export const changeEventTypeOptions = Object.values(ChangeEventType);

export function projectStatusTone(status: ProjectStatus) {
  if (status === ProjectStatus.ACTIVE) {
    return "success" as const;
  }

  if (status === ProjectStatus.PAUSED) {
    return "warning" as const;
  }

  return "muted" as const;
}

export function listingStatusTone(status: ListingStatus) {
  if (status === ListingStatus.ACTIVE) {
    return "success" as const;
  }

  if (status === ListingStatus.PAUSED || status === ListingStatus.DRAFT) {
    return "warning" as const;
  }

  return "muted" as const;
}
