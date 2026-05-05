import {
  ChangeEventType,
  CsvImportStatus,
  CsvImportType,
  InsightConfidence,
  InsightStatus,
  InsightType,
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

export const csvImportStatusLabels: Record<CsvImportStatus, string> = {
  PENDING: "Pendiente",
  PROCESSED: "Procesada",
  PARTIAL: "Parcial",
  FAILED: "Fallida",
};

export const csvImportTypeLabels: Record<CsvImportType, string> = {
  LISTING_METRICS: "Metricas de publicaciones",
  CHANGE_EVENTS: "Cambios",
  LISTINGS: "Publicaciones",
  SEARCH_RESULTS: "Resultados de busqueda",
  COMPETITORS: "Competidores",
  OTHER: "Otro",
};

export const insightTypeLabels: Record<InsightType, string> = {
  CHANGE_IMPACT: "Impacto de cambio",
  ATTRIBUTION_MIXED: "Atribucion mixta",
  COMPETITOR_CONTEXT: "Contexto competitivo",
  STOCK_ALERT: "Alerta de stock",
  VISIBILITY_ALERT: "Alerta de visibilidad",
  LEARNING_NOTE: "Aprendizaje",
  OTHER: "Otro",
};

export const insightConfidenceLabels: Record<InsightConfidence, string> = {
  LOW: "bajo",
  MEDIUM: "medio",
  HIGH: "alto",
};

export const insightStatusLabels: Record<InsightStatus, string> = {
  NEW: "Nueva",
  REVIEWED: "Revisada",
  DISMISSED: "Descartada",
  ARCHIVED: "Archivada",
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

export function csvImportStatusTone(status: CsvImportStatus) {
  if (status === CsvImportStatus.PROCESSED) {
    return "success" as const;
  }

  if (status === CsvImportStatus.PARTIAL || status === CsvImportStatus.PENDING) {
    return "warning" as const;
  }

  return "danger" as const;
}

export function insightConfidenceTone(confidence: InsightConfidence | "LOW" | "MEDIUM" | "HIGH") {
  if (confidence === "HIGH") {
    return "success" as const;
  }

  if (confidence === "MEDIUM") {
    return "warning" as const;
  }

  return "muted" as const;
}
