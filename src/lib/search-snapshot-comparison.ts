export type ComparableSearchResult = {
  id: string;
  position: number;
  observedTitle: string;
  observedPrice: number | null;
  observedSellerName: string | null;
  isOwnListing: boolean;
  competitorId: string | null;
  ownListingId: string | null;
  externalListingId: string | null;
  competitor?: {
    id: string;
    name: string;
  } | null;
  ownListing?: {
    id: string;
    title: string;
    externalId?: string | null;
  } | null;
};

export type ComparableSearchSnapshot = {
  id: string;
  capturedAt: Date;
  results: ComparableSearchResult[];
};

export type ShelfPresence = {
  totalResults: number;
  ownCount: number;
  competitorCount: number;
  unknownCount: number;
  ownTop5Count: number;
  ownTop10Count: number;
  ownPresentTop5: boolean;
  ownPresentTop10: boolean;
  competitorAppearances: ShelfOwnerAppearance[];
};

export type ShelfOwnerAppearance = {
  key: string;
  label: string;
  count: number;
  top5Count: number;
  top10Count: number;
  positions: number[];
};

export type SearchSnapshotComparison = {
  beforeSnapshotId: string;
  afterSnapshotId: string;
  before: ShelfPresence;
  after: ShelfPresence;
  newCompetitors: ShelfOwnerAppearance[];
  disappearedCompetitors: ShelfOwnerAppearance[];
  priceChanges: SnapshotPriceChange[];
};

export type SnapshotPriceChange = {
  key: string;
  label: string;
  beforePrice: number;
  afterPrice: number;
  absoluteDelta: number;
  percentDelta: number | null;
  beforePosition: number;
  afterPosition: number;
};

type OwnerIdentity = {
  key: string;
  label: string;
  kind: "own" | "competitor" | "unknown";
};

export function buildShelfPresence(snapshot: ComparableSearchSnapshot): ShelfPresence {
  const competitorMap = new Map<string, ShelfOwnerAppearance>();
  let ownCount = 0;
  let competitorCount = 0;
  let unknownCount = 0;
  let ownTop5Count = 0;
  let ownTop10Count = 0;

  for (const result of sortedResults(snapshot.results)) {
    const owner = getOwnerIdentity(result);

    if (owner.kind === "own") {
      ownCount += 1;
      if (result.position <= 5) {
        ownTop5Count += 1;
      }
      if (result.position <= 10) {
        ownTop10Count += 1;
      }
      continue;
    }

    if (owner.kind === "unknown") {
      unknownCount += 1;
      continue;
    }

    competitorCount += 1;
    const current = competitorMap.get(owner.key) ?? {
      key: owner.key,
      label: owner.label,
      count: 0,
      top5Count: 0,
      top10Count: 0,
      positions: [],
    };

    current.count += 1;
    current.positions.push(result.position);

    if (result.position <= 5) {
      current.top5Count += 1;
    }

    if (result.position <= 10) {
      current.top10Count += 1;
    }

    competitorMap.set(owner.key, current);
  }

  return {
    totalResults: snapshot.results.length,
    ownCount,
    competitorCount,
    unknownCount,
    ownTop5Count,
    ownTop10Count,
    ownPresentTop5: ownTop5Count > 0,
    ownPresentTop10: ownTop10Count > 0,
    competitorAppearances: Array.from(competitorMap.values()).sort(compareAppearances),
  };
}

export function compareSearchSnapshots(
  before: ComparableSearchSnapshot,
  after: ComparableSearchSnapshot,
): SearchSnapshotComparison {
  const beforePresence = buildShelfPresence(before);
  const afterPresence = buildShelfPresence(after);
  const beforeCompetitors = mapByKey(beforePresence.competitorAppearances);
  const afterCompetitors = mapByKey(afterPresence.competitorAppearances);

  return {
    beforeSnapshotId: before.id,
    afterSnapshotId: after.id,
    before: beforePresence,
    after: afterPresence,
    newCompetitors: afterPresence.competitorAppearances.filter(
      (appearance) => !beforeCompetitors.has(appearance.key),
    ),
    disappearedCompetitors: beforePresence.competitorAppearances.filter(
      (appearance) => !afterCompetitors.has(appearance.key),
    ),
    priceChanges: buildPriceChanges(before.results, after.results),
  };
}

function buildPriceChanges(
  beforeResults: ComparableSearchResult[],
  afterResults: ComparableSearchResult[],
) {
  const beforeByKey = new Map<string, ComparableSearchResult>();

  for (const result of beforeResults) {
    beforeByKey.set(getResultIdentityKey(result), result);
  }

  return sortedResults(afterResults).flatMap((afterResult) => {
    const beforeResult = beforeByKey.get(getResultIdentityKey(afterResult));
    if (!beforeResult) {
      return [];
    }

    if (beforeResult.observedPrice === null || afterResult.observedPrice === null) {
      return [];
    }

    const absoluteDelta = afterResult.observedPrice - beforeResult.observedPrice;
    if (Math.abs(absoluteDelta) < 0.0001) {
      return [];
    }

    return [
      {
        key: getResultIdentityKey(afterResult),
        label: getResultLabel(afterResult),
        beforePrice: beforeResult.observedPrice,
        afterPrice: afterResult.observedPrice,
        absoluteDelta,
        percentDelta:
          beforeResult.observedPrice === 0 ? null : absoluteDelta / Math.abs(beforeResult.observedPrice),
        beforePosition: beforeResult.position,
        afterPosition: afterResult.position,
      },
    ];
  });
}

function getOwnerIdentity(result: ComparableSearchResult): OwnerIdentity {
  if (result.isOwnListing || result.ownListingId) {
    return {
      key: "own",
      label: "Publicaciones propias",
      kind: "own",
    };
  }

  if (result.competitorId) {
    return {
      key: `competitor:${result.competitorId}`,
      label: result.competitor?.name ?? result.observedSellerName ?? "Competidor sin nombre",
      kind: "competitor",
    };
  }

  if (result.observedSellerName) {
    return {
      key: `seller:${normalizeKey(result.observedSellerName)}`,
      label: result.observedSellerName,
      kind: "competitor",
    };
  }

  return {
    key: `unknown:${normalizeKey(result.observedTitle)}`,
    label: "Sin vendedor identificado",
    kind: "unknown",
  };
}

function getResultIdentityKey(result: ComparableSearchResult) {
  if (result.ownListingId) {
    return `own-listing:${result.ownListingId}`;
  }

  if (result.externalListingId) {
    return `external:${normalizeKey(result.externalListingId)}`;
  }

  if (result.competitorId) {
    return `competitor-result:${result.competitorId}:${normalizeKey(result.observedTitle)}`;
  }

  if (result.observedSellerName) {
    return `seller-result:${normalizeKey(result.observedSellerName)}:${normalizeKey(result.observedTitle)}`;
  }

  return `result:${normalizeKey(result.observedTitle)}`;
}

function getResultLabel(result: ComparableSearchResult) {
  if (result.ownListing) {
    return result.ownListing.title;
  }

  if (result.competitor) {
    return `${result.competitor.name}: ${result.observedTitle}`;
  }

  if (result.observedSellerName) {
    return `${result.observedSellerName}: ${result.observedTitle}`;
  }

  return result.observedTitle;
}

function sortedResults(results: ComparableSearchResult[]) {
  return [...results].sort((left, right) => left.position - right.position);
}

function compareAppearances(left: ShelfOwnerAppearance, right: ShelfOwnerAppearance) {
  if (right.count !== left.count) {
    return right.count - left.count;
  }

  return Math.min(...left.positions) - Math.min(...right.positions);
}

function mapByKey(appearances: ShelfOwnerAppearance[]) {
  return new Map(appearances.map((appearance) => [appearance.key, appearance]));
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
