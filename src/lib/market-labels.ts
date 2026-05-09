import {
  ChangeEventType,
  CsvImportStatus,
  CsvImportType,
  InsightConfidence,
  InsightStatus,
  InsightType,
  ListingStatus,
  OpportunitySeverity,
  OpportunityStatus,
  OpportunityType,
  ProjectStatus,
  SearchSnapshotSource,
} from "@/generated/prisma";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  ARCHIVED: "Archivado",
};

export const marketplaceOptions = [
  { value: "mercado-libre", label: "Mercado Libre" },
  { value: "amazon", label: "Amazon" },
  { value: "tiendanube", label: "Tiendanube" },
  { value: "shopify", label: "Shopify" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "shopee", label: "Shopee" },
  { value: "falabella", label: "Falabella" },
  { value: "ripley", label: "Ripley" },
  { value: "magalu", label: "Magazine Luiza" },
  { value: "americanas", label: "Americanas" },
  { value: "walmart-marketplace", label: "Walmart Marketplace" },
  { value: "ebay", label: "eBay" },
  { value: "etsy", label: "Etsy" },
  { value: "otro", label: "Otro marketplace" },
];

export function marketplaceLabel(value: string) {
  return marketplaceOptions.find((option) => option.value === value)?.label ?? value;
}

export const currencyOptions = [
  { value: "ARS", label: "ARS - Peso argentino" },
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "BRL", label: "BRL - Real brasileño" },
  { value: "CLP", label: "CLP - Peso chileno" },
  { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "UYU", label: "UYU - Peso uruguayo" },
];

export function currencyLabel(value: string) {
  return currencyOptions.find((option) => option.value === value)?.label ?? value;
}

export const listingStatusLabels: Record<ListingStatus, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  DRAFT: "Borrador",
  ENDED: "Finalizada",
  ARCHIVED: "Archivada",
};

export const changeEventTypeLabels: Record<ChangeEventType, string> = {
  PRICE_UPDATE: "Precio",
  TITLE_UPDATE: "Título",
  IMAGE_UPDATE: "Imágenes",
  DESCRIPTION_UPDATE: "Descripción",
  PROMOTION_UPDATE: "Promoción",
  STOCK_UPDATE: "Stock",
  ADS_UPDATE: "Ads",
  SHIPPING_UPDATE: "Envío",
  CATALOG_UPDATE: "Catálogo",
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
  LISTING_METRICS: "Métricas de publicaciones",
  CHANGE_EVENTS: "Cambios",
  LISTINGS: "Publicaciones",
  SEARCH_RESULTS: "Resultados de búsqueda",
  COMPETITORS: "Competidores",
  OTHER: "Otro",
};

export const insightTypeLabels: Record<InsightType, string> = {
  CHANGE_IMPACT: "Impacto de cambio",
  ATTRIBUTION_MIXED: "Atribución mixta",
  COMPETITOR_CONTEXT: "Contexto competitivo",
  STOCK_ALERT: "Alerta de stock",
  VISIBILITY_ALERT: "Alerta de visibilidad",
  LEARNING_NOTE: "Aprendizaje",
  OTHER: "Otro",
};

export const insightConfidenceLabels: Record<InsightConfidence, string> = {
  LOW: "baja",
  MEDIUM: "media",
  HIGH: "alta",
};

export const insightStatusLabels: Record<InsightStatus, string> = {
  NEW: "Nueva",
  REVIEWED: "Revisada",
  DISMISSED: "Descartada",
  ARCHIVED: "Archivada",
};

export const opportunityTypeLabels: Record<OpportunityType, string> = {
  VISIBILITY_GAP: "Brecha de visibilidad",
  PRICE_GAP: "Hueco de precio",
  STOCK_ADVANTAGE: "Ventaja de stock",
  COMPETITOR_EXIT: "Salida de competidor",
  COMPETITOR_PRESSURE: "Presión competitiva",
  ASSORTMENT_GAP: "Hueco de surtido",
  OTHER: "Señal operativa",
};

export const opportunitySeverityLabels: Record<OpportunitySeverity, string> = {
  LOW: "baja",
  MEDIUM: "media",
  HIGH: "alta",
};

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  NEW: "Nueva",
  REVIEWED: "Revisada",
  DISMISSED: "Descartada",
  ACTIONED: "Accionada",
};

export const projectStatusOptions = Object.values(ProjectStatus);
export const projectCreationStatusOptions = projectStatusOptions.filter(
  (status) => status !== ProjectStatus.ARCHIVED,
);
export const listingStatusOptions = Object.values(ListingStatus);
export const changeEventTypeOptions = Object.values(ChangeEventType);
export const opportunitySeverityOptions = Object.values(OpportunitySeverity);
export const opportunityStatusOptions = Object.values(OpportunityStatus);

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

export function opportunitySeverityTone(severity: OpportunitySeverity) {
  if (severity === OpportunitySeverity.HIGH) {
    return "danger" as const;
  }

  if (severity === OpportunitySeverity.MEDIUM) {
    return "warning" as const;
  }

  return "muted" as const;
}

export function opportunityStatusTone(status: OpportunityStatus) {
  if (status === OpportunityStatus.NEW) {
    return "warning" as const;
  }

  if (status === OpportunityStatus.REVIEWED || status === OpportunityStatus.ACTIONED) {
    return "success" as const;
  }

  return "muted" as const;
}
