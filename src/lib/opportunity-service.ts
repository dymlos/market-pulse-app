import {
  OpportunitySeverity,
  OpportunityStatus,
  OpportunityType,
  ProjectStatus,
} from "@/generated/prisma";
import { generateOpportunitySignalCandidates } from "@/lib/opportunity-rules";
import type { OpportunityProjectContext } from "@/lib/opportunity-rules";
import { prisma } from "@/lib/prisma";

type DetectOpportunitySignalsInput = {
  projectId?: string;
  now?: Date;
};

export type DetectOpportunitySignalsResult = {
  candidateCount: number;
  createdCount: number;
  existingCount: number;
};

export async function detectAndPersistOpportunitySignals(
  input: DetectOpportunitySignalsInput = {},
): Promise<DetectOpportunitySignalsResult> {
  const contexts = await getOpportunityContexts(input.projectId);
  const candidates = contexts.flatMap((context) =>
    generateOpportunitySignalCandidates({
      context,
      now: input.now,
    }),
  );

  let createdCount = 0;
  let existingCount = 0;

  for (const candidate of candidates) {
    const existing = await prisma.opportunitySignal.findFirst({
      where: {
        projectId: candidate.projectId,
        listingId: candidate.listingId,
        trackedSearchId: candidate.trackedSearchId,
        type: candidate.type as OpportunityType,
        explanation: candidate.explanation,
      },
      select: { id: true },
    });

    if (existing) {
      existingCount += 1;
      continue;
    }

    await prisma.opportunitySignal.create({
      data: {
        projectId: candidate.projectId,
        listingId: candidate.listingId,
        trackedSearchId: candidate.trackedSearchId,
        type: candidate.type as OpportunityType,
        severity: candidate.severity as OpportunitySeverity,
        explanation: candidate.explanation,
        status: OpportunityStatus.NEW,
        detectedAt: candidate.detectedAt,
      },
    });

    createdCount += 1;
  }

  return {
    candidateCount: candidates.length,
    createdCount,
    existingCount,
  };
}

async function getOpportunityContexts(projectId?: string): Promise<OpportunityProjectContext[]> {
  const projects = await prisma.project.findMany({
    where: {
      id: projectId || undefined,
      status: { not: ProjectStatus.ARCHIVED },
    },
    include: {
      listings: {
        include: {
          metricSnapshots: {
            orderBy: { snapshotDate: "asc" },
          },
          changeEvents: {
            orderBy: { occurredAt: "asc" },
          },
        },
        orderBy: { title: "asc" },
      },
      trackedSearches: {
        include: {
          snapshots: {
            include: {
              results: {
                include: {
                  competitor: true,
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { capturedAt: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return projects.map((project) => ({
    project: {
      id: project.id,
      name: project.name,
      currencyCode: project.currencyCode,
    },
    listings: project.listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      metricSnapshots: listing.metricSnapshots.map((snapshot) => ({
        id: snapshot.id,
        snapshotDate: snapshot.snapshotDate,
        visits: snapshot.visits,
        salesUnits: snapshot.salesUnits,
        conversionRate: snapshot.conversionRate,
      })),
      changeEvents: listing.changeEvents.map((change) => ({
        id: change.id,
        occurredAt: change.occurredAt,
        type: change.type,
        detail: change.detail,
      })),
    })),
    trackedSearches: project.trackedSearches.map((trackedSearch) => ({
      id: trackedSearch.id,
      name: trackedSearch.name,
      query: trackedSearch.query,
      isActive: trackedSearch.isActive,
      snapshots: trackedSearch.snapshots.map((snapshot) => ({
        id: snapshot.id,
        capturedAt: snapshot.capturedAt,
        results: snapshot.results.map((result) => ({
          id: result.id,
          position: result.position,
          observedTitle: result.observedTitle,
          observedPrice: result.observedPrice,
          observedSellerName: result.observedSellerName,
          visibleFlags: result.visibleFlags,
          notes: result.notes,
          isOwnListing: result.isOwnListing,
          ownListingId: result.ownListingId,
          competitorId: result.competitorId,
          competitorName: result.competitor?.name ?? null,
        })),
      })),
    })),
  }));
}
