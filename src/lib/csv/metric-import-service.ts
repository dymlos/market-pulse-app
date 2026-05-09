import { CsvImportStatus, CsvImportType, ListingStatus } from "@/generated/prisma";
import { suggestMetricMapping, type MetricImportMapping } from "@/lib/csv/metric-mapping";
import { parseCsv } from "@/lib/csv/parser";
import {
  type ManualResolutionMap,
  type MissingListingDraft,
  type SnapshotMetricData,
  validateMetricRows,
} from "@/lib/csv/metric-validation";
import { prisma } from "@/lib/prisma";

type MetricImportIssue = {
  rowNumber?: number;
  type: "parse" | "invalid" | "skipped" | "mapping";
  message: string;
  listingReference?: string;
};

type MetricImportCounts = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  createdListings: number;
};

export type MetricImportMetadata = {
  snapshotDateRange?: {
    from: string;
    to: string;
  };
  affectedListings: Array<{
    id: string;
    title: string;
    reference: string;
  }>;
};

export type MetricImportResult = {
  ok: boolean;
  importId?: string;
  status: CsvImportStatus;
  counts: MetricImportCounts;
  metadata?: MetricImportMetadata;
  issues: MetricImportIssue[];
};

function compactIssues(issues: MetricImportIssue[]) {
  return issues.slice(0, 80);
}

function buildSummary(input: {
  message: string;
  counts: MetricImportCounts;
  metadata?: MetricImportMetadata;
  issues: MetricImportIssue[];
}) {
  return JSON.stringify(
    {
      message: input.message,
      counts: input.counts,
      metadata: input.metadata,
      issues: compactIssues(input.issues),
    },
    null,
    2,
  );
}

function buildDateRange(dates: Date[]) {
  if (dates.length === 0) {
    return undefined;
  }

  const timestamps = dates.map((date) => date.getTime());
  return {
    from: new Date(Math.min(...timestamps)).toISOString(),
    to: new Date(Math.max(...timestamps)).toISOString(),
  };
}

function statusForCounts(counts: MetricImportCounts) {
  const issueCount = counts.invalidRows + counts.skippedRows;

  if (counts.validRows === 0) {
    return CsvImportStatus.FAILED;
  }

  if (issueCount > 0) {
    return CsvImportStatus.PARTIAL;
  }

  return CsvImportStatus.PROCESSED;
}

function buildIssueList(input: {
  parseErrors: Array<{ rowNumber?: number; message: string }>;
  mappingErrors?: string[];
  invalidRows: Array<{ rowNumber: number; message: string }>;
  skippedRows: Array<{ rowNumber: number; message: string; listingReference?: string }>;
}) {
  return [
    ...input.parseErrors.map((error) => ({
      rowNumber: error.rowNumber,
      type: "parse" as const,
      message: error.message,
    })),
    ...(input.mappingErrors ?? []).map((message) => ({
      type: "mapping" as const,
      message,
    })),
    ...input.invalidRows.map((row) => ({
      rowNumber: row.rowNumber,
      type: "invalid" as const,
      message: row.message,
    })),
    ...input.skippedRows.map((row) => ({
      rowNumber: row.rowNumber,
      type: "skipped" as const,
      message: row.message,
      listingReference: row.listingReference,
    })),
  ];
}

async function getListingLookups(projectId: string) {
  return prisma.listing.findMany({
    where: { projectId },
    select: {
      id: true,
      externalId: true,
      sku: true,
      title: true,
    },
    orderBy: { title: "asc" },
  });
}

function uniqueUnresolvedReferences(
  skippedRows: Array<{ code: string; listingReference?: string }>,
) {
  const references = new Set<string>();

  for (const row of skippedRows) {
    if (row.code === "LISTING_NOT_FOUND" && row.listingReference) {
      references.add(row.listingReference);
    }
  }

  return Array.from(references).slice(0, 30);
}

export async function buildMetricImportPreview(input: {
  projectId: string;
  csvText: string;
}) {
  const [project, listings] = await Promise.all([
    prisma.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, name: true },
    }),
    getListingLookups(input.projectId),
  ]);

  if (!project) {
    throw new Error("No se encontro el proyecto seleccionado.");
  }

  const parsed = parseCsv(input.csvText);
  const suggestedMapping = suggestMetricMapping(parsed.headers);
  const validation = validateMetricRows({
    rows: parsed.rows,
    mapping: suggestedMapping,
    listings,
    missingListingMode: "skip",
  });

  return {
    project,
    delimiter: parsed.delimiter === "\t" ? "tab" : parsed.delimiter,
    headers: parsed.headers,
    totalRows: parsed.rows.length,
    previewRows: parsed.rows.slice(0, 8).map((row) => ({
      rowNumber: row.rowNumber,
      cells: row.cells,
    })),
    suggestedMapping,
    parseErrors: parsed.errors.slice(0, 20),
    validationSummary: {
      validRows: validation.validRows.length,
      invalidRows: validation.invalidRows.length,
      skippedRows: validation.skippedRows.length,
      mappingErrors: validation.mappingErrors,
    },
    unresolvedListingReferences: uniqueUnresolvedReferences(validation.skippedRows),
    listings,
  };
}

function cleanManualResolutions(manualResolutions: ManualResolutionMap | undefined) {
  const cleaned: ManualResolutionMap = {};

  for (const [reference, listingId] of Object.entries(manualResolutions ?? {})) {
    if (reference.trim() && listingId.trim()) {
      cleaned[reference.trim()] = listingId.trim();
    }
  }

  return cleaned;
}

function buildCreateListingPayload(projectId: string, draft: MissingListingDraft, fileName: string) {
  return {
    projectId,
    title: draft.title,
    externalId: draft.externalId,
    sku: draft.sku,
    status: ListingStatus.ACTIVE,
    marketplace: "mercado-libre",
    notes: `Creada automaticamente desde importacion CSV ${fileName}.`,
  };
}

function snapshotCreateData(listingId: string, snapshotDate: Date, snapshotData: SnapshotMetricData) {
  return {
    listingId,
    snapshotDate,
    ...snapshotData,
  };
}

export async function importMetricCsv(input: {
  projectId: string;
  fileName: string;
  csvText: string;
  mapping: MetricImportMapping;
  createMissingListings: boolean;
  manualResolutions?: ManualResolutionMap;
}): Promise<MetricImportResult> {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("No se encontro el proyecto seleccionado.");
  }

  const parsed = parseCsv(input.csvText);
  const listings = await getListingLookups(input.projectId);
  const validation = validateMetricRows({
    rows: parsed.rows,
    mapping: input.mapping,
    listings,
    missingListingMode: input.createMissingListings ? "create" : "skip",
    manualResolutions: cleanManualResolutions(input.manualResolutions),
  });

  const mappingIssues = validation.mappingErrors.map((message) => ({
    type: "mapping" as const,
    message,
  }));

  if (validation.mappingErrors.length > 0) {
    const counts: MetricImportCounts = {
      totalRows: parsed.rows.length,
      validRows: 0,
      invalidRows: parsed.rows.length,
      skippedRows: 0,
      createdListings: 0,
    };
    const issues = buildIssueList({
      parseErrors: parsed.errors,
      mappingErrors: validation.mappingErrors,
      invalidRows: [],
      skippedRows: [],
    });
    const csvImport = await prisma.csvImport.create({
      data: {
        projectId: input.projectId,
        type: CsvImportType.LISTING_METRICS,
        fileName: input.fileName,
        status: CsvImportStatus.FAILED,
        totalRows: counts.totalRows,
        validRows: counts.validRows,
        invalidRows: counts.invalidRows,
        summary: buildSummary({
          message: "Importacion fallida por mapping incompleto.",
          counts,
          issues: mappingIssues,
        }),
      },
    });

    return {
      ok: false,
      importId: csvImport.id,
      status: csvImport.status,
      counts,
      issues,
    };
  }

  const issues = buildIssueList({
    parseErrors: parsed.errors,
    invalidRows: validation.invalidRows,
    skippedRows: validation.skippedRows,
  });
  const missingDrafts = new Map<string, MissingListingDraft>();

  for (const row of validation.validRows) {
    if (row.createListing && !missingDrafts.has(row.createListing.key)) {
      missingDrafts.set(row.createListing.key, row.createListing);
    }
  }

  try {
    return await prisma.$transaction(async (transaction) => {
      const createdListingIds = new Map<string, string>();
      const affectedListings = new Map<
        string,
        { id: string; title: string; reference: string }
      >();
      const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
      const persistedDates: Date[] = [];

      for (const draft of missingDrafts.values()) {
        const createdListing = await transaction.listing.create({
          data: buildCreateListingPayload(input.projectId, draft, input.fileName),
          select: { id: true },
        });
        createdListingIds.set(draft.key, createdListing.id);
        affectedListings.set(createdListing.id, {
          id: createdListing.id,
          title: draft.title,
          reference: draft.reference,
        });
      }

      let persistedRows = 0;

      for (const row of validation.validRows) {
        const listingId =
          row.listingId ??
          (row.createListing ? createdListingIds.get(row.createListing.key) : undefined);

        if (!listingId) {
          continue;
        }

        const existingListing = listingsById.get(listingId);
        if (!affectedListings.has(listingId)) {
          affectedListings.set(listingId, {
            id: listingId,
            title: existingListing?.title ?? row.createListing?.title ?? row.listingReference,
            reference: row.listingReference,
          });
        }

        await transaction.listingMetricSnapshot.upsert({
          where: {
            listingId_snapshotDate: {
              listingId,
              snapshotDate: row.snapshotDate,
            },
          },
          update: row.snapshotData,
          create: snapshotCreateData(listingId, row.snapshotDate, row.snapshotData),
        });
        persistedRows += 1;
        persistedDates.push(row.snapshotDate);
      }

      const counts: MetricImportCounts = {
        totalRows: parsed.rows.length,
        validRows: persistedRows,
        invalidRows: validation.invalidRows.length,
        skippedRows: validation.skippedRows.length,
        createdListings: createdListingIds.size,
      };
      const metadata: MetricImportMetadata = {
        snapshotDateRange: buildDateRange(persistedDates),
        affectedListings: Array.from(affectedListings.values()).slice(0, 50),
      };
      const status = statusForCounts(counts);
      const csvImport = await transaction.csvImport.create({
        data: {
          projectId: input.projectId,
          type: CsvImportType.LISTING_METRICS,
          fileName: input.fileName,
          status,
          totalRows: counts.totalRows,
          validRows: counts.validRows,
          invalidRows: counts.invalidRows,
          summary: buildSummary({
            message: "Importacion de snapshots metricos finalizada.",
            counts,
            metadata,
            issues,
          }),
        },
      });

      return {
        ok: status !== CsvImportStatus.FAILED,
        importId: csvImport.id,
        status,
        counts,
        metadata,
        issues: compactIssues(issues),
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al importar CSV.";
    const counts: MetricImportCounts = {
      totalRows: parsed.rows.length,
      validRows: 0,
      invalidRows: parsed.rows.length,
      skippedRows: 0,
      createdListings: 0,
    };
    const failureIssue: MetricImportIssue = {
      type: "invalid",
      message,
    };
    const csvImport = await prisma.csvImport.create({
      data: {
        projectId: input.projectId,
        type: CsvImportType.LISTING_METRICS,
        fileName: input.fileName,
        status: CsvImportStatus.FAILED,
        totalRows: counts.totalRows,
        validRows: counts.validRows,
        invalidRows: counts.invalidRows,
        summary: buildSummary({
          message: "Importacion fallida durante la persistencia.",
          counts,
          issues: [failureIssue],
        }),
      },
    });

    return {
      ok: false,
      importId: csvImport.id,
      status: csvImport.status,
      counts,
      issues: [failureIssue],
    };
  }
}
