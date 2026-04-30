export const metricImportFields = [
  { key: "date", label: "Fecha", required: true },
  { key: "listingId", label: "ID interno de publicacion", required: false },
  { key: "listingExternalId", label: "ID externo", required: false },
  { key: "listingSku", label: "SKU", required: false },
  { key: "listingTitle", label: "Nombre de publicacion", required: false },
  { key: "listingKey", label: "Publicacion auto", required: false },
  { key: "visits", label: "Visitas", required: false },
  { key: "sales", label: "Ventas unidades", required: false },
  { key: "conversion", label: "Conversion", required: false },
  { key: "revenue", label: "Facturacion", required: false },
  { key: "stock", label: "Stock", required: false },
  { key: "price", label: "Precio", required: false },
  { key: "adSpend", label: "Gasto ads", required: false },
  { key: "notes", label: "Notas", required: false },
] as const;

export type MetricImportField = (typeof metricImportFields)[number]["key"];
export type MetricImportMapping = Partial<Record<MetricImportField, string>>;

const aliases: Record<MetricImportField, string[]> = {
  date: [
    "date",
    "fecha",
    "dia",
    "day",
    "snapshot_date",
    "fecha_snapshot",
    "fecha_metricas",
    "recorded_at",
  ],
  listingKey: [
    "listing",
    "publicacion",
    "listing_slug",
    "publication",
    "item",
    "item_id",
    "producto",
    "producto_id",
  ],
  listingId: ["listing_id", "id_publicacion", "publicacion_id", "internal_listing_id"],
  listingExternalId: [
    "listing_external_id",
    "external_id",
    "id_externo",
    "meli_id",
    "mercadolibre_id",
    "ml_id",
    "mla_id",
  ],
  listingSku: ["sku", "seller_sku", "codigo", "codigo_sku", "codigo_interno"],
  listingTitle: [
    "listing_title",
    "title",
    "titulo",
    "nombre",
    "nombre_publicacion",
    "publicacion_nombre",
  ],
  visits: ["visits", "visitas", "views", "page_views", "sesiones", "trafico"],
  sales: ["sales", "sales_units", "units_sold", "orders", "ventas", "unidades", "pedidos"],
  conversion: [
    "conversion",
    "conversion_rate",
    "conversion_rate_percent",
    "tasa_conversion",
    "cr",
  ],
  revenue: ["revenue", "facturacion", "importe", "monto", "ventas_pesos", "gmv", "total_sales"],
  stock: ["stock", "available_stock", "stock_disponible", "existencias", "inventory"],
  price: ["price", "precio", "current_price", "precio_actual", "sale_price"],
  adSpend: ["ad_spend", "ads_spend", "gasto_ads", "publicidad", "inversion_ads", "product_ads"],
  notes: ["notes", "notas", "comment", "comments", "comentarios", "observaciones"],
};

const listingResolverFields: MetricImportField[] = [
  "listingId",
  "listingExternalId",
  "listingSku",
  "listingTitle",
  "listingKey",
];

const metricValueFields: MetricImportField[] = [
  "visits",
  "sales",
  "conversion",
  "revenue",
  "stock",
  "price",
  "adSpend",
  "notes",
];

export function normalizeColumnName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function suggestMetricMapping(headers: string[]): MetricImportMapping {
  const normalizedHeaders = headers.map((header) => ({
    header,
    normalized: normalizeColumnName(header),
  }));
  const usedHeaders = new Set<string>();
  const mapping: MetricImportMapping = {};

  for (const field of metricImportFields) {
    const normalizedAliases = aliases[field.key].map(normalizeColumnName);
    const exactMatch = normalizedHeaders.find(
      (candidate) =>
        !usedHeaders.has(candidate.header) && normalizedAliases.includes(candidate.normalized),
    );

    if (exactMatch) {
      mapping[field.key] = exactMatch.header;
      usedHeaders.add(exactMatch.header);
      continue;
    }

    const partialMatch = normalizedHeaders.find(
      (candidate) =>
        !usedHeaders.has(candidate.header) &&
        normalizedAliases.some((alias) => candidate.normalized.includes(alias)),
    );

    if (partialMatch) {
      mapping[field.key] = partialMatch.header;
      usedHeaders.add(partialMatch.header);
    }
  }

  return mapping;
}

export function hasListingResolver(mapping: MetricImportMapping) {
  return listingResolverFields.some((field) => Boolean(mapping[field]));
}

export function hasMetricValue(mapping: MetricImportMapping) {
  return metricValueFields.some((field) => Boolean(mapping[field]));
}

export function validateMetricMapping(mapping: MetricImportMapping) {
  const errors: string[] = [];

  if (!mapping.date) {
    errors.push("Mapea una columna de fecha.");
  }

  if (!hasListingResolver(mapping)) {
    errors.push("Mapea una columna que identifique la publicacion.");
  }

  if (!hasMetricValue(mapping)) {
    errors.push("Mapea al menos una metrica o notas.");
  }

  return errors;
}

export function metricFieldLabel(field: MetricImportField) {
  return metricImportFields.find((candidate) => candidate.key === field)?.label ?? field;
}
