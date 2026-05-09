import {
  ChangeEventType,
  CsvImportStatus,
  ListingStatus,
  OpportunitySeverity,
  OpportunityStatus,
  ProjectStatus,
} from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { compareSearchSnapshots } from "@/lib/search-snapshot-comparison";

type ProjectFilters = {
  query?: string;
  status?: ProjectStatus;
  marketplace?: string;
  includeArchived?: boolean;
};

export const LISTING_LOW_STOCK_THRESHOLD = 5;

export type ListingTrackingFilter =
  | "WITH_CHANGES"
  | "WITHOUT_CHANGES"
  | "WITH_SNAPSHOTS"
  | "WITHOUT_SNAPSHOTS"
  | "WITH_ACTIVE_OPPORTUNITIES";

export type ListingStockFilter = "LOW_STOCK";

export type ListingDataFilter =
  | ListingTrackingFilter
  | ListingStockFilter
  | "WITH_OPPORTUNITIES";

type ListingFilters = {
  projectId?: string;
  query?: string;
  status?: ListingStatus;
  trackingState?: ListingTrackingFilter;
  stockState?: ListingStockFilter;
  dataState?: ListingDataFilter;
};

export type ChangeTimeFilter = "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH";

type ChangeEventFilters = {
  projectId?: string;
  listingId?: string;
  type?: ChangeEventType;
  query?: string;
  timeframe?: ChangeTimeFilter;
};

export type CsvImportTimeFilter = "LAST_7_DAYS" | "LAST_30_DAYS";

type CsvImportFilters = {
  projectId?: string;
  query?: string;
  status?: CsvImportStatus;
  timeframe?: CsvImportTimeFilter;
};

function getListingTrackingFilter(filters: ListingFilters): ListingTrackingFilter | undefined {
  const trackingState = filters.trackingState ?? filters.dataState;

  if (trackingState === "WITH_OPPORTUNITIES") {
    return "WITH_ACTIVE_OPPORTUNITIES";
  }

  if (trackingState === "LOW_STOCK") {
    return undefined;
  }

  return trackingState;
}

function getListingStockFilter(filters: ListingFilters): ListingStockFilter | undefined {
  return filters.stockState ?? (filters.dataState === "LOW_STOCK" ? "LOW_STOCK" : undefined);
}

function getChangeTimeRange(timeframe?: ChangeTimeFilter): Prisma.DateTimeFilter | undefined {
  const now = new Date();

  if (timeframe === "LAST_7_DAYS") {
    const since = new Date(now);
    since.setDate(since.getDate() - 7);
    return { gte: since };
  }

  if (timeframe === "LAST_30_DAYS") {
    const since = new Date(now);
    since.setDate(since.getDate() - 30);
    return { gte: since };
  }

  if (timeframe === "THIS_MONTH") {
    return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  }

  return undefined;
}

function getCsvImportTimeRange(
  timeframe?: CsvImportTimeFilter,
): Prisma.DateTimeFilter | undefined {
  const now = new Date();

  if (timeframe === "LAST_7_DAYS") {
    const since = new Date(now);
    since.setDate(since.getDate() - 7);
    return { gte: since };
  }

  if (timeframe === "LAST_30_DAYS") {
    const since = new Date(now);
    since.setDate(since.getDate() - 30);
    return { gte: since };
  }

  return undefined;
}

async function enrichChangesWithFollowUp<
  T extends { listingId: string; occurredAt: Date },
>(changes: T[]) {
  if (changes.length === 0) {
    return [];
  }

  const listingIds = Array.from(new Set(changes.map((change) => change.listingId)));
  const snapshots = await prisma.listingMetricSnapshot.findMany({
    where: {
      listingId: { in: listingIds },
    },
    orderBy: { snapshotDate: "asc" },
  });

  const snapshotsByListing = new Map<string, typeof snapshots>();
  for (const snapshot of snapshots) {
    const current = snapshotsByListing.get(snapshot.listingId) ?? [];
    current.push(snapshot);
    snapshotsByListing.set(snapshot.listingId, current);
  }

  return changes.map((change) => {
    const listingSnapshots = snapshotsByListing.get(change.listingId) ?? [];
    const previousSnapshot =
      listingSnapshots
        .filter((snapshot) => snapshot.snapshotDate <= change.occurredAt)
        .at(-1) ?? null;
    const followUpSnapshot =
      listingSnapshots.find((snapshot) => snapshot.snapshotDate > change.occurredAt) ?? null;

    return {
      ...change,
      previousSnapshot,
      followUpSnapshot,
    };
  });
}

export async function getDashboardOverview() {
  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - 14);

  const [
    projectCount,
    listingCount,
    recentChangeCount,
    trackedSearchCount,
    recentChanges,
    recentProjects,
    recentListings,
  ] = await Promise.all([
    prisma.project.count({ where: { status: { not: ProjectStatus.ARCHIVED } } }),
    prisma.listing.count(),
    prisma.changeEvent.count({ where: { occurredAt: { gte: recentSince } } }),
    prisma.trackedSearch.count({ where: { isActive: true } }),
    prisma.changeEvent.findMany({
      include: { listing: { include: { project: true } } },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.listing.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return {
    projectCount,
    listingCount,
    recentChangeCount,
    trackedSearchCount,
    recentChanges,
    recentProjects,
    recentListings,
  };
}

export async function getProjects(filters: ProjectFilters = {}) {
  return prisma.project.findMany({
    where: {
      name: filters.query ? { contains: filters.query } : undefined,
      status: filters.status
        ? filters.status
        : filters.includeArchived
          ? undefined
          : { not: ProjectStatus.ARCHIVED },
      marketplace: filters.marketplace || undefined,
    },
    include: {
      _count: {
        select: {
          listings: true,
          trackedSearches: true,
          csvImports: true,
          opportunitySignals: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getProjectMarketplaceFilters() {
  return prisma.project.findMany({
    distinct: ["marketplace"],
    orderBy: { marketplace: "asc" },
    select: { marketplace: true },
  });
}

export async function getProjectOptions() {
  return prisma.project.findMany({
    where: { status: { not: ProjectStatus.ARCHIVED } },
    orderBy: { name: "asc" },
  });
}

export async function getProjectForEdit(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
  });
}

export async function getProjectDetail(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          listings: true,
          trackedSearches: true,
          csvImports: true,
          opportunitySignals: true,
        },
      },
      listings: {
        include: {
          _count: {
            select: {
              changeEvents: true,
              metricSnapshots: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      trackedSearches: {
        include: {
          _count: {
            select: {
              snapshots: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      csvImports: {
        orderBy: { importedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!project) {
    return null;
  }

  const [changeEventsCount, metricSnapshotsCount, recentChanges] = await Promise.all([
    prisma.changeEvent.count({ where: { listing: { projectId } } }),
    prisma.listingMetricSnapshot.count({ where: { listing: { projectId } } }),
    prisma.changeEvent.findMany({
      where: { listing: { projectId } },
      include: { listing: true },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    project,
    changeEventsCount,
    metricSnapshotsCount,
    recentChanges,
  };
}

export async function getListings(filters: ListingFilters = {}) {
  const trackingState = getListingTrackingFilter(filters);
  const stockState = getListingStockFilter(filters);

  return prisma.listing.findMany({
    where: {
      projectId: filters.projectId || undefined,
      status: filters.status || undefined,
      OR: filters.query
        ? [
            { title: { contains: filters.query } },
            { sku: { contains: filters.query } },
            { externalId: { contains: filters.query } },
          ]
        : undefined,
      changeEvents:
        trackingState === "WITH_CHANGES"
          ? { some: {} }
          : trackingState === "WITHOUT_CHANGES"
            ? { none: {} }
            : undefined,
      metricSnapshots:
        trackingState === "WITH_SNAPSHOTS"
          ? { some: {} }
          : trackingState === "WITHOUT_SNAPSHOTS"
            ? { none: {} }
            : undefined,
      availableStock:
        stockState === "LOW_STOCK" ? { lte: LISTING_LOW_STOCK_THRESHOLD } : undefined,
      opportunitySignals:
        trackingState === "WITH_ACTIVE_OPPORTUNITIES"
          ? { some: { status: { in: [OpportunityStatus.NEW, OpportunityStatus.REVIEWED] } } }
          : undefined,
    },
    include: {
      project: true,
      changeEvents: {
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
      metricSnapshots: {
        orderBy: { snapshotDate: "desc" },
        take: 1,
      },
      _count: {
        select: {
          changeEvents: true,
          metricSnapshots: true,
          insights: true,
          opportunitySignals: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getListingOptions(projectId?: string) {
  return prisma.listing.findMany({
    where: {
      projectId: projectId || undefined,
    },
    include: { project: true },
    orderBy: [{ project: { name: "asc" } }, { title: "asc" }],
  });
}

export async function getListingDetail(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      project: true,
      _count: {
        select: {
          changeEvents: true,
          metricSnapshots: true,
          insights: true,
          opportunitySignals: true,
        },
      },
      changeEvents: {
        orderBy: { occurredAt: "desc" },
        take: 60,
      },
      metricSnapshots: {
        orderBy: { snapshotDate: "desc" },
        take: 120,
      },
      insights: {
        orderBy: { recordedAt: "desc" },
        take: 8,
      },
    },
  });
}

export async function getListingForEdit(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
  });
}

export async function getChangeEvents(filters: ChangeEventFilters = {}) {
  const andClauses: Prisma.ChangeEventWhereInput[] = [];

  if (filters.projectId) {
    andClauses.push({ listing: { projectId: filters.projectId } });
  }

  if (filters.query) {
    andClauses.push({
      OR: [
        { detail: { contains: filters.query } },
        { comment: { contains: filters.query } },
        { actorName: { contains: filters.query } },
        { hypothesis: { contains: filters.query } },
        { listing: { title: { contains: filters.query } } },
        { listing: { sku: { contains: filters.query } } },
        { listing: { externalId: { contains: filters.query } } },
      ],
    });
  }

  const changes = await prisma.changeEvent.findMany({
    where: {
      listingId: filters.listingId || undefined,
      type: filters.type || undefined,
      occurredAt: getChangeTimeRange(filters.timeframe),
      AND: andClauses.length > 0 ? andClauses : undefined,
    },
    include: {
      listing: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  return enrichChangesWithFollowUp(changes);
}

export async function getChangeEventDetail(changeEventId: string) {
  const change = await prisma.changeEvent.findUnique({
    where: { id: changeEventId },
    include: {
      listing: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!change) {
    return null;
  }

  const [enrichedChange] = await enrichChangesWithFollowUp([change]);
  return enrichedChange;
}

export async function getChangeEventForEdit(changeEventId: string) {
  return prisma.changeEvent.findUnique({
    where: { id: changeEventId },
  });
}

export async function getTrackedSearches(projectId?: string) {
  return prisma.trackedSearch.findMany({
    where: {
      projectId: projectId || undefined,
    },
    include: {
      project: true,
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          snapshots: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTrackedSearchDetail(trackedSearchId: string) {
  return prisma.trackedSearch.findUnique({
    where: { id: trackedSearchId },
    include: {
      project: true,
      snapshots: {
        include: {
          _count: {
            select: {
              results: true,
            },
          },
        },
        orderBy: { capturedAt: "desc" },
      },
    },
  });
}

export async function getTrackedSearchForEdit(trackedSearchId: string) {
  return prisma.trackedSearch.findUnique({
    where: { id: trackedSearchId },
  });
}

export async function getTrackedSearchComparison(
  trackedSearchId: string,
  beforeSnapshotId?: string,
  afterSnapshotId?: string,
) {
  const snapshots = await prisma.searchSnapshot.findMany({
    where: { trackedSearchId },
    include: {
      results: {
        include: {
          competitor: true,
          ownListing: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { capturedAt: "desc" },
  });

  const afterSnapshot =
    snapshots.find((snapshot) => snapshot.id === afterSnapshotId) ?? snapshots[0] ?? null;
  const beforeSnapshot =
    snapshots.find((snapshot) => snapshot.id === beforeSnapshotId) ??
    snapshots.find((snapshot) => snapshot.id !== afterSnapshot?.id) ??
    null;

  if (!beforeSnapshot || !afterSnapshot || beforeSnapshot.id === afterSnapshot.id) {
    return {
      snapshots,
      beforeSnapshot,
      afterSnapshot,
      comparison: null,
    };
  }

  return {
    snapshots,
    beforeSnapshot,
    afterSnapshot,
    comparison: compareSearchSnapshots(beforeSnapshot, afterSnapshot),
  };
}

export async function getSearchSnapshotDetail(snapshotId: string) {
  return prisma.searchSnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      trackedSearch: {
        include: {
          project: true,
        },
      },
      results: {
        include: {
          competitor: true,
          ownListing: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getCompetitors(projectId?: string) {
  return prisma.competitor.findMany({
    where: {
      projectId: projectId || undefined,
    },
    include: {
      project: true,
      _count: {
        select: {
          searchResultItems: true,
        },
      },
    },
    orderBy: [{ project: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getCompetitorOptions(projectId: string) {
  return prisma.competitor.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
}

export async function getCsvImports(filters: string | CsvImportFilters = {}) {
  const normalizedFilters = typeof filters === "string" ? { projectId: filters } : filters;

  return prisma.csvImport.findMany({
    where: {
      projectId: normalizedFilters.projectId || undefined,
      status: normalizedFilters.status || undefined,
      importedAt: getCsvImportTimeRange(normalizedFilters.timeframe),
      OR: normalizedFilters.query
        ? [
            { fileName: { contains: normalizedFilters.query } },
            { project: { name: { contains: normalizedFilters.query } } },
          ]
        : undefined,
    },
    include: {
      project: true,
    },
    orderBy: { importedAt: "desc" },
    take: 15,
  });
}

export async function getOpportunitySignals(filters: {
  projectId?: string;
  listingId?: string;
  trackedSearchId?: string;
  severity?: OpportunitySeverity;
  status?: OpportunityStatus;
} = {}) {
  return prisma.opportunitySignal.findMany({
    where: {
      projectId: filters.projectId || undefined,
      listingId: filters.listingId || undefined,
      trackedSearchId: filters.trackedSearchId || undefined,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
    },
    include: {
      project: true,
      listing: true,
      trackedSearch: true,
    },
    orderBy: [{ detectedAt: "desc" }, { createdAt: "desc" }],
  });
}
