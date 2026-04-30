import { ChangeEventType, ProjectStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

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

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      _count: {
        select: {
          listings: true,
          trackedSearches: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
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

export async function getListings(filters: { projectId?: string } = {}) {
  return prisma.listing.findMany({
    where: {
      projectId: filters.projectId || undefined,
    },
    include: {
      project: true,
      _count: {
        select: {
          changeEvents: true,
          metricSnapshots: true,
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
      changeEvents: {
        orderBy: { occurredAt: "desc" },
        take: 6,
      },
      metricSnapshots: {
        orderBy: { snapshotDate: "desc" },
        take: 6,
      },
    },
  });
}

export async function getListingForEdit(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
  });
}

export async function getChangeEvents(filters: {
  projectId?: string;
  listingId?: string;
  type?: ChangeEventType;
} = {}) {
  return prisma.changeEvent.findMany({
    where: {
      listingId: filters.listingId || undefined,
      type: filters.type || undefined,
      listing: filters.projectId ? { projectId: filters.projectId } : undefined,
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
}

export async function getChangeEventDetail(changeEventId: string) {
  return prisma.changeEvent.findUnique({
    where: { id: changeEventId },
    include: {
      listing: {
        include: {
          project: true,
        },
      },
    },
  });
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

export async function getCsvImports(projectId?: string) {
  return prisma.csvImport.findMany({
    where: {
      projectId: projectId || undefined,
    },
    include: {
      project: true,
    },
    orderBy: { importedAt: "desc" },
    take: 15,
  });
}
