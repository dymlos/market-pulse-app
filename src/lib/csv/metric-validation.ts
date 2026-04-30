import type { CsvParsedRow } from "@/lib/csv/parser";
import type { MetricImportField, MetricImportMapping } from "@/lib/csv/metric-mapping";
import { validateMetricMapping } from "@/lib/csv/metric-mapping";

export type ListingLookup = {
  id: string;
  externalId: string | null;
  sku: string | null;
  title: string;
};

export type MissingListingMode = "skip" | "create";

export type ManualResolutionMap = Record<string, string>;

export type SnapshotMetricData = {
  visits?: number;
  salesUnits?: number;
  conversionRate?: number;
  revenue?: number;
  availableStock?: number;
  price?: number;
  adSpend?: number;
  notes?: string;
};

export type MissingListingDraft = {
  reference: string;
  key: string;
  title: string;
  externalId?: string;
  sku?: string;
};

export type ValidMetricRow = {
  rowNumber: number;
  listingId?: string;
  listingReference: string;
  createListing?: MissingListingDraft;
  snapshotDate: Date;
  snapshotData: SnapshotMetricData;
};

export type InvalidMetricRow = {
  rowNumber: number;
  code: string;
  message: string;
};

export type SkippedMetricRow = {
  rowNumber: number;
  code: string;
  message: string;
  listingReference?: string;
};

export type MetricRowsValidationResult = {
  mappingErrors: string[];
  validRows: ValidMetricRow[];
  invalidRows: InvalidMetricRow[];
  skippedRows: SkippedMetricRow[];
};

type ListingIndexes = {
  byId: Map<string, ListingLookup>;
  byExternalId: Map<string, ListingLookup>;
  bySku: Map<string, ListingLookup>;
  byTitle: Map<string, ListingLookup>;
  generic: Map<string, ListingLookup>;
};

type NumericSnapshotMetricKey = Exclude<keyof SnapshotMetricData, "notes">;

const listingResolverFields: MetricImportField[] = [
  "listingId",
  "listingExternalId",
  "listingSku",
  "listingTitle",
  "listingKey",
];

function normalizeLoose(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeExact(value: string) {
  return value.trim().toLowerCase();
}

function addIndex(map: Map<string, ListingLookup>, key: string | null | undefined, listing: ListingLookup) {
  if (!key) {
    return;
  }

  const exact = normalizeExact(key);
  const loose = normalizeLoose(key);

  if (exact && !map.has(exact)) {
    map.set(exact, listing);
  }

  if (loose && !map.has(loose)) {
    map.set(loose, listing);
  }
}

function buildListingIndexes(listings: ListingLookup[]): ListingIndexes {
  const indexes: ListingIndexes = {
    byId: new Map(),
    byExternalId: new Map(),
    bySku: new Map(),
    byTitle: new Map(),
    generic: new Map(),
  };

  for (const listing of listings) {
    addIndex(indexes.byId, listing.id, listing);
    addIndex(indexes.byExternalId, listing.externalId, listing);
    addIndex(indexes.bySku, listing.sku, listing);
    addIndex(indexes.byTitle, listing.title, listing);

    addIndex(indexes.generic, listing.id, listing);
    addIndex(indexes.generic, listing.externalId, listing);
    addIndex(indexes.generic, listing.sku, listing);
    addIndex(indexes.generic, listing.title, listing);
  }

  return indexes;
}

function readMappedValue(row: CsvParsedRow, mapping: MetricImportMapping, field: MetricImportField) {
  const header = mapping[field];
  return header ? row.values[header]?.trim() ?? "" : "";
}

function createUtcDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseYear(value: string) {
  const year = Number(value);
  if (!Number.isInteger(year)) {
    return null;
  }

  return year < 100 ? 2000 + year : year;
}

export function parseSnapshotDate(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return createUtcDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const compactMatch = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compactMatch) {
    return createUtcDate(Number(compactMatch[1]), Number(compactMatch[2]), Number(compactMatch[3]));
  }

  const slashMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const year = parseYear(slashMatch[3]);

    if (!year) {
      return null;
    }

    if (first > 12) {
      return createUtcDate(year, second, first);
    }

    if (second > 12) {
      return createUtcDate(year, first, second);
    }

    return createUtcDate(year, second, first);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return createUtcDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
}

function normalizeNumberText(rawValue: string, options: { preferDecimalForTripleGroup?: boolean } = {}) {
  const withoutSymbols = rawValue
    .trim()
    .replace(/\s|\u00A0/g, "")
    .replace(/\$/g, "")
    .replace(/%/g, "");

  if (!withoutSymbols) {
    return "";
  }

  const commaIndex = withoutSymbols.lastIndexOf(",");
  const dotIndex = withoutSymbols.lastIndexOf(".");

  if (commaIndex >= 0 && dotIndex >= 0) {
    const decimalSeparator = commaIndex > dotIndex ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    return withoutSymbols
      .replace(new RegExp(`\\${thousandsSeparator}`, "g"), "")
      .replace(decimalSeparator, ".");
  }

  if (commaIndex >= 0) {
    const parts = withoutSymbols.split(",");
    if (parts.length > 2) {
      const decimals = parts.pop() ?? "";
      return `${parts.join("")}.${decimals}`;
    }

    const [integerPart, decimalPart = ""] = parts;
    const looksLikeThousands =
      decimalPart.length === 3 &&
      integerPart !== "0" &&
      !options.preferDecimalForTripleGroup;

    return looksLikeThousands ? `${integerPart}${decimalPart}` : `${integerPart}.${decimalPart}`;
  }

  if (dotIndex >= 0) {
    const parts = withoutSymbols.split(".");
    if (parts.length > 2) {
      const decimals = parts.pop() ?? "";
      return `${parts.join("")}.${decimals}`;
    }

    const [integerPart, decimalPart = ""] = parts;
    const looksLikeThousands =
      decimalPart.length === 3 &&
      integerPart !== "0" &&
      !options.preferDecimalForTripleGroup;

    return looksLikeThousands ? `${integerPart}${decimalPart}` : withoutSymbols;
  }

  return withoutSymbols;
}

export function parseFlexibleNumber(
  rawValue: string,
  options: { preferDecimalForTripleGroup?: boolean } = {},
) {
  const normalized = normalizeNumberText(rawValue, options);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntegerMetric(rawValue: string) {
  if (!rawValue.trim()) {
    return { value: undefined };
  }

  const parsed = parseFlexibleNumber(rawValue);
  if (parsed === null || parsed < 0 || !Number.isInteger(parsed)) {
    return { error: "debe ser un numero entero no negativo" };
  }

  return { value: parsed };
}

function parseDecimalMetric(rawValue: string, options: { conversion?: boolean } = {}) {
  if (!rawValue.trim()) {
    return { value: undefined };
  }

  const parsed = parseFlexibleNumber(rawValue, {
    preferDecimalForTripleGroup: options.conversion,
  });

  if (parsed === null || parsed < 0) {
    return { error: "debe ser un numero no negativo" };
  }

  if (options.conversion && !rawValue.includes("%") && parsed > 0 && parsed <= 1) {
    return { value: parsed * 100 };
  }

  return { value: parsed };
}

function parseSnapshotData(row: CsvParsedRow, mapping: MetricImportMapping) {
  const errors: string[] = [];
  const snapshotData: SnapshotMetricData = {};

  const integerMetrics: Array<[MetricImportField, NumericSnapshotMetricKey]> = [
    ["visits", "visits"],
    ["sales", "salesUnits"],
    ["stock", "availableStock"],
  ];

  for (const [field, target] of integerMetrics) {
    const rawValue = readMappedValue(row, mapping, field);
    const parsed = parseIntegerMetric(rawValue);
    if (parsed.error) {
      errors.push(`${field}: ${parsed.error}`);
    } else if (parsed.value !== undefined) {
      snapshotData[target] = parsed.value;
    }
  }

  const decimalMetrics: Array<[MetricImportField, NumericSnapshotMetricKey]> = [
    ["conversion", "conversionRate"],
    ["revenue", "revenue"],
    ["price", "price"],
    ["adSpend", "adSpend"],
  ];

  for (const [field, target] of decimalMetrics) {
    const rawValue = readMappedValue(row, mapping, field);
    const parsed = parseDecimalMetric(rawValue, { conversion: field === "conversion" });
    if (parsed.error) {
      errors.push(`${field}: ${parsed.error}`);
    } else if (parsed.value !== undefined) {
      snapshotData[target] = parsed.value;
    }
  }

  const notes = readMappedValue(row, mapping, "notes");
  if (notes) {
    snapshotData.notes = notes;
  }

  return { snapshotData, errors };
}

function resolveManualListing(
  reference: string,
  manualResolutions: ManualResolutionMap,
  listingsById: Map<string, ListingLookup>,
) {
  const directListingId = manualResolutions[reference.trim()];
  if (directListingId && listingsById.has(directListingId)) {
    return listingsById.get(directListingId);
  }

  const looseReference = normalizeLoose(reference);
  const looseMatch = Object.entries(manualResolutions).find(
    ([key, listingId]) => normalizeLoose(key) === looseReference && listingsById.has(listingId),
  );

  return looseMatch ? listingsById.get(looseMatch[1]) : undefined;
}

function resolveListingForRow(
  row: CsvParsedRow,
  mapping: MetricImportMapping,
  indexes: ListingIndexes,
  manualResolutions: ManualResolutionMap,
) {
  const attempts = listingResolverFields
    .map((field) => ({ field, rawValue: readMappedValue(row, mapping, field) }))
    .filter((attempt) => attempt.rawValue.length > 0);

  for (const attempt of attempts) {
    const manualListing = resolveManualListing(attempt.rawValue, manualResolutions, indexes.byId);
    if (manualListing) {
      return { listing: manualListing, reference: attempt.rawValue };
    }
  }

  for (const attempt of attempts) {
    const exact = normalizeExact(attempt.rawValue);
    const loose = normalizeLoose(attempt.rawValue);
    let listing: ListingLookup | undefined;

    if (attempt.field === "listingId") {
      listing = indexes.byId.get(exact) ?? indexes.byId.get(loose);
    } else if (attempt.field === "listingExternalId") {
      listing = indexes.byExternalId.get(exact) ?? indexes.byExternalId.get(loose);
    } else if (attempt.field === "listingSku") {
      listing = indexes.bySku.get(exact) ?? indexes.bySku.get(loose);
    } else if (attempt.field === "listingTitle") {
      listing = indexes.byTitle.get(loose);
    } else {
      listing = indexes.generic.get(exact) ?? indexes.generic.get(loose);
    }

    if (listing) {
      return { listing, reference: attempt.rawValue };
    }
  }

  return { reference: attempts[0]?.rawValue ?? "" };
}

function buildMissingListingDraft(
  row: CsvParsedRow,
  mapping: MetricImportMapping,
  reference: string,
): MissingListingDraft {
  const title = readMappedValue(row, mapping, "listingTitle") || reference || "Publicacion importada";
  const externalId = readMappedValue(row, mapping, "listingExternalId") || undefined;
  const sku = readMappedValue(row, mapping, "listingSku") || undefined;

  return {
    reference,
    key: normalizeLoose(reference || title),
    title,
    externalId,
    sku,
  };
}

function buildRowKey(row: ValidMetricRow) {
  const listingKey = row.listingId ?? row.createListing?.key ?? normalizeLoose(row.listingReference);
  return `${listingKey}:${row.snapshotDate.toISOString().slice(0, 10)}`;
}

export function validateMetricRows(input: {
  rows: CsvParsedRow[];
  mapping: MetricImportMapping;
  listings: ListingLookup[];
  missingListingMode: MissingListingMode;
  manualResolutions?: ManualResolutionMap;
}): MetricRowsValidationResult {
  const mappingErrors = validateMetricMapping(input.mapping);
  const validRows: ValidMetricRow[] = [];
  const invalidRows: InvalidMetricRow[] = [];
  const skippedRows: SkippedMetricRow[] = [];
  const seenRows = new Set<string>();

  if (mappingErrors.length > 0) {
    return { mappingErrors, validRows, invalidRows, skippedRows };
  }

  const indexes = buildListingIndexes(input.listings);
  const manualResolutions = input.manualResolutions ?? {};

  for (const row of input.rows) {
    const errors: string[] = [];
    const rawDate = readMappedValue(row, input.mapping, "date");
    const snapshotDate = parseSnapshotDate(rawDate);

    if (!snapshotDate) {
      errors.push("fecha invalida o vacia");
    }

    const { snapshotData, errors: metricErrors } = parseSnapshotData(row, input.mapping);
    errors.push(...metricErrors);

    if (Object.keys(snapshotData).length === 0) {
      errors.push("sin metricas ni notas para guardar");
    }

    const { listing, reference } = resolveListingForRow(
      row,
      input.mapping,
      indexes,
      manualResolutions,
    );

    if (!reference) {
      errors.push("sin referencia de publicacion");
    }

    if (errors.length > 0 || !snapshotDate) {
      invalidRows.push({
        rowNumber: row.rowNumber,
        code: "INVALID_ROW",
        message: errors.join("; "),
      });
      continue;
    }

    if (!listing && input.missingListingMode === "skip") {
      skippedRows.push({
        rowNumber: row.rowNumber,
        code: "LISTING_NOT_FOUND",
        message: "No se encontro una publicacion existente para la fila.",
        listingReference: reference,
      });
      continue;
    }

    const validRow: ValidMetricRow = {
      rowNumber: row.rowNumber,
      listingId: listing?.id,
      listingReference: reference,
      createListing: listing ? undefined : buildMissingListingDraft(row, input.mapping, reference),
      snapshotDate,
      snapshotData,
    };

    const rowKey = buildRowKey(validRow);
    if (seenRows.has(rowKey)) {
      skippedRows.push({
        rowNumber: row.rowNumber,
        code: "DUPLICATED_SNAPSHOT_IN_FILE",
        message: "La misma publicacion y fecha ya aparecio en este CSV.",
        listingReference: reference,
      });
      continue;
    }

    seenRows.add(rowKey);
    validRows.push(validRow);
  }

  return { mappingErrors, validRows, invalidRows, skippedRows };
}
