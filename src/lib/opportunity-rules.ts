export type OpportunityTypeValue =
  | "VISIBILITY_GAP"
  | "PRICE_GAP"
  | "STOCK_ADVANTAGE"
  | "COMPETITOR_EXIT"
  | "COMPETITOR_PRESSURE"
  | "ASSORTMENT_GAP"
  | "OTHER";

export type OpportunitySeverityValue = "LOW" | "MEDIUM" | "HIGH";

export type OpportunityProjectContext = {
  project: {
    id: string;
    name: string;
    currencyCode?: string | null;
  };
  listings: OpportunityListingContext[];
  trackedSearches: OpportunityTrackedSearchContext[];
};

export type OpportunityListingContext = {
  id: string;
  title: string;
  metricSnapshots: OpportunityMetricSnapshotContext[];
  changeEvents: OpportunityChangeEventContext[];
};

export type OpportunityMetricSnapshotContext = {
  id: string;
  snapshotDate: Date;
  visits: number | null;
  salesUnits: number | null;
  conversionRate: number | null;
};

export type OpportunityChangeEventContext = {
  id: string;
  occurredAt: Date;
  type: string;
  detail: string;
};

export type OpportunityTrackedSearchContext = {
  id: string;
  name: string;
  query: string;
  isActive: boolean;
  snapshots: OpportunitySearchSnapshotContext[];
};

export type OpportunitySearchSnapshotContext = {
  id: string;
  capturedAt: Date;
  results: OpportunitySearchResultContext[];
};

export type OpportunitySearchResultContext = {
  id: string;
  position: number;
  observedTitle: string;
  observedPrice: number | null;
  observedSellerName: string | null;
  visibleFlags: string | null;
  notes: string | null;
  isOwnListing: boolean;
  ownListingId: string | null;
  competitorId: string | null;
  competitorName: string | null;
};

export type OpportunitySignalCandidate = {
  ruleId: string;
  projectId: string;
  listingId: string | null;
  trackedSearchId: string | null;
  type: OpportunityTypeValue;
  severity: OpportunitySeverityValue;
  explanation: string;
  detectedAt: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_SNAPSHOT_DAYS = 21;
const FOLLOW_UP_WINDOW_DAYS = 14;
const LOW_VISIBILITY_VISITS = 100;
const GOOD_CONVERSION_RATE = 4.5;
const PRICE_GAP_RATIO = 0.15;
const PRICE_GAP_MIN_ABSOLUTE = 10000;

export function generateOpportunitySignalCandidates(input: {
  context: OpportunityProjectContext;
  now?: Date;
}): OpportunitySignalCandidate[] {
  const now = input.now ?? new Date();
  const signals = [
    ...generateSearchSignals(input.context, now),
    ...generateListingSignals(input.context, now),
  ];

  return dedupeSignals(signals);
}

function generateSearchSignals(
  context: OpportunityProjectContext,
  now: Date,
): OpportunitySignalCandidate[] {
  const signals: OpportunitySignalCandidate[] = [];

  for (const search of context.trackedSearches) {
    if (!search.isActive) {
      continue;
    }

    const snapshots = sortSearchSnapshots(search.snapshots);
    const latest = snapshots[snapshots.length - 1] ?? null;
    const previous = snapshots[snapshots.length - 2] ?? null;

    if (!latest) {
      signals.push(
        buildSignal({
          ruleId: "search-without-snapshots",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "OTHER",
          severity: "MEDIUM",
          explanation: `La busqueda "${search.name}" todavia no tiene snapshots cargados. Sin esa foto no hay contexto suficiente para detectar presencia propia, huecos de precio o movimientos de competidores.`,
          now,
        }),
      );
      continue;
    }

    const daysSinceSnapshot = daysBetween(latest.capturedAt, now);
    if (daysSinceSnapshot > RECENT_SNAPSHOT_DAYS) {
      signals.push(
        buildSignal({
          ruleId: "search-without-recent-snapshots",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "OTHER",
          severity: "LOW",
          explanation: `La busqueda "${search.name}" no tiene snapshots recientes. El ultimo snapshot tiene ${Math.floor(daysSinceSnapshot)} dias y puede estar dejando fuera cambios competitivos importantes.`,
          now,
        }),
      );
    }

    const presence = buildSearchPresence(latest.results);

    if (latest.results.length === 0) {
      signals.push(
        buildSignal({
          ruleId: "search-empty-latest-snapshot",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "OTHER",
          severity: "MEDIUM",
          explanation: `El snapshot mas reciente de "${search.name}" no tiene resultados observados. Conviene cargar al menos el top visible antes de interpretar oportunidades.`,
          now,
        }),
      );
      continue;
    }

    if (presence.ownCount === 0) {
      signals.push(
        buildSignal({
          ruleId: "search-no-own-presence",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "VISIBILITY_GAP",
          severity: "HIGH",
          explanation: `La busqueda "${search.name}" no muestra presencia propia en el snapshot mas reciente. Es una alerta alta porque el contexto cargado solo muestra competidores o resultados sin vinculo propio.`,
          now,
        }),
      );
    } else if (isLowOwnPresence(presence)) {
      signals.push(
        buildSignal({
          ruleId: "search-low-own-presence",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "VISIBILITY_GAP",
          severity: "MEDIUM",
          explanation: `La busqueda "${search.name}" muestra poca presencia propia frente a competidores visibles: ${presence.ownCount} aparicion propia sobre ${presence.totalResults} resultados observados.`,
          now,
        }),
      );
    }

    const concentratedCompetitor = findConcentratedCompetitor(presence);
    if (concentratedCompetitor) {
      signals.push(
        buildSignal({
          ruleId: "search-competitor-concentration",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "COMPETITOR_PRESSURE",
          severity: concentratedCompetitor.top5Count >= 3 ? "HIGH" : "MEDIUM",
          explanation: `La busqueda "${search.name}" esta concentrada en pocos competidores. ${concentratedCompetitor.label} aparece ${concentratedCompetitor.count} veces, con posiciones ${concentratedCompetitor.positions.join(", ")}.`,
          now,
        }),
      );
    }

    const priceGap = findVisiblePriceGap(latest.results);
    if (priceGap) {
      signals.push(
        buildSignal({
          ruleId: "search-visible-price-gap",
          projectId: context.project.id,
          trackedSearchId: search.id,
          type: "PRICE_GAP",
          severity: "MEDIUM",
          explanation: `Hay un hueco observable de precio en "${search.name}" entre ${formatMoney(priceGap.lowerPrice)} y ${formatMoney(priceGap.upperPrice)}. Conviene revisar si una publicacion propia puede posicionarse en ese espacio sin erosionar margen.`,
          now,
        }),
      );
    }

    const weakCompetitor = findWeakCompetitorAvailability(latest.results);
    if (weakCompetitor) {
      signals.push(
        buildSignal({
          ruleId: "search-competitor-weak-stock",
          projectId: context.project.id,
          trackedSearchId: search.id,
          listingId: presence.firstOwnListingId,
          type: "STOCK_ADVANTAGE",
          severity: presence.ownTop10Count > 0 ? "MEDIUM" : "LOW",
          explanation: `El snapshot mas reciente de "${search.name}" muestra a ${weakCompetitor.label} con disponibilidad dudosa o mencion de stock. Puede haber una ventana operativa para sostener stock propio, revisar ads y capturar mas clics.`,
          now,
        }),
      );
    }

    if (previous) {
      const previousPresence = buildSearchPresence(previous.results);

      if (previousPresence.ownTop5Count > 0 && presence.ownTop5Count === 0) {
        signals.push(
          buildSignal({
            ruleId: "search-own-lost-top5",
            projectId: context.project.id,
            trackedSearchId: search.id,
            listingId: previousPresence.firstOwnListingId,
            type: "VISIBILITY_GAP",
            severity: "HIGH",
            explanation: `La presencia propia salio del top 5 en "${search.name}" entre los dos ultimos snapshots. Es una alerta alta porque cambia la visibilidad visible en una busqueda monitoreada.`,
            now,
          }),
        );
      } else if (previousPresence.ownTop10Count > 0 && presence.ownTop10Count === 0) {
        signals.push(
          buildSignal({
            ruleId: "search-own-lost-top10",
            projectId: context.project.id,
            trackedSearchId: search.id,
            listingId: previousPresence.firstOwnListingId,
            type: "VISIBILITY_GAP",
            severity: "MEDIUM",
            explanation: `La presencia propia salio del top 10 en "${search.name}" entre los dos ultimos snapshots. Conviene revisar si hubo cambios propios, precio o presion competitiva en la misma ventana.`,
            now,
          }),
        );
      }

      const disappearedCompetitors = findDisappearedCompetitors(previousPresence, presence);
      if (disappearedCompetitors.length > 0) {
        signals.push(
          buildSignal({
            ruleId: "search-competitor-exit",
            projectId: context.project.id,
            trackedSearchId: search.id,
            listingId: presence.firstOwnListingId,
            type: "COMPETITOR_EXIT",
            severity: "MEDIUM",
            explanation: `El snapshot mas reciente de "${search.name}" ya no muestra a ${joinLabels(disappearedCompetitors)}. Puede ser una mejora potencial si antes ocupaban posiciones visibles.`,
            now,
          }),
        );
      }
    }
  }

  return signals;
}

function generateListingSignals(
  context: OpportunityProjectContext,
  now: Date,
): OpportunitySignalCandidate[] {
  const latestSearchSnapshots = context.trackedSearches
    .filter((search) => search.isActive)
    .map((search) => sortSearchSnapshots(search.snapshots).at(-1) ?? null)
    .filter((snapshot): snapshot is OpportunitySearchSnapshotContext => snapshot !== null);

  const signals: OpportunitySignalCandidate[] = [];

  for (const listing of context.listings) {
    const snapshots = sortMetricSnapshots(listing.metricSnapshots);
    const changes = sortChanges(listing.changeEvents);
    const latestSnapshot = snapshots[snapshots.length - 1] ?? null;
    const previousSnapshot = snapshots[snapshots.length - 2] ?? null;
    const latestChange = changes[changes.length - 1] ?? null;

    if (snapshots.length < 2) {
      signals.push(
        buildSignal({
          ruleId: "listing-insufficient-snapshots",
          projectId: context.project.id,
          listingId: listing.id,
          type: "OTHER",
          severity: changes.length > 0 ? "MEDIUM" : "LOW",
          explanation:
            changes.length > 0
              ? `La publicacion "${listing.title}" tiene cambios registrados, pero no tiene snapshots metricos suficientes para interpretar impacto antes/despues.`
              : `La publicacion "${listing.title}" no tiene snapshots metricos suficientes para detectar oportunidades defendibles.`,
          now,
        }),
      );
    }

    if (latestChange && !hasFollowUpSnapshot(snapshots, latestChange.occurredAt)) {
      signals.push(
        buildSignal({
          ruleId: "listing-change-without-follow-up",
          projectId: context.project.id,
          listingId: listing.id,
          type: "OTHER",
          severity: "MEDIUM",
          explanation: `La publicacion "${listing.title}" tiene un cambio reciente sin snapshot posterior dentro de ${FOLLOW_UP_WINDOW_DAYS} dias. Conviene cargar seguimiento antes de sacar conclusiones.`,
          now,
        }),
      );
    }

    if (latestSnapshot) {
      if (
        latestSnapshot.conversionRate !== null &&
        latestSnapshot.conversionRate >= GOOD_CONVERSION_RATE &&
        latestSnapshot.visits !== null &&
        latestSnapshot.visits < LOW_VISIBILITY_VISITS
      ) {
        signals.push(
          buildSignal({
            ruleId: "listing-good-conversion-low-visibility",
            projectId: context.project.id,
            listingId: listing.id,
            type: "VISIBILITY_GAP",
            severity: "MEDIUM",
            explanation: `La publicacion "${listing.title}" convierte bien (${formatPercent(latestSnapshot.conversionRate)}), pero tiene poca visibilidad reciente (${latestSnapshot.visits} visitas). Puede convenir revisar presencia en busquedas, ads o contexto competitivo antes de tocar precio.`,
            now,
          }),
        );
      }
    }

    if (previousSnapshot && latestSnapshot && isStagnant(previousSnapshot, latestSnapshot)) {
      const recentChanges = changes.filter((change) => daysBetween(change.occurredAt, latestSnapshot.snapshotDate) <= 21);
      if (recentChanges.length === 0) {
        signals.push(
          buildSignal({
            ruleId: "listing-stagnant-few-changes",
            projectId: context.project.id,
            listingId: listing.id,
            type: "OTHER",
            severity: "LOW",
            explanation: `La publicacion "${listing.title}" muestra metricas estancadas entre los ultimos snapshots y pocos cambios recientes. Puede ser buen candidato para una accion operativa pequena y medible.`,
            now,
          }),
        );
      }
    }

    if (changes.length >= 2 && snapshots.length >= 2) {
      const firstChange = changes[0];
      const before = findSnapshotBefore(snapshots, firstChange.occurredAt) ?? snapshots[0];
      const after = latestSnapshot;

      if (after && !hasVisibleImprovement(before, after)) {
        signals.push(
          buildSignal({
            ruleId: "listing-many-changes-no-visible-improvement",
            projectId: context.project.id,
            listingId: listing.id,
            type: "OTHER",
            severity: hasVisibleDrop(before, after) ? "HIGH" : "MEDIUM",
            explanation: `Hubo varios cambios en "${listing.title}" sin mejora visible en los snapshots posteriores. Conviene revisar la hipotesis original antes de seguir acumulando ajustes.`,
            now,
          }),
        );
      } else if (after && hasWeakImprovement(before, after)) {
        signals.push(
          buildSignal({
            ruleId: "listing-high-activity-doubtful-results",
            projectId: context.project.id,
            listingId: listing.id,
            type: "OTHER",
            severity: "MEDIUM",
            explanation: `La publicacion "${listing.title}" tiene actividad operativa alta y resultados todavia dudosos. Hay mejoras leves, pero no suficientes para explicar con confianza que los cambios funcionaron.`,
            now,
          }),
        );
      }
    }

    if (
      changes.length > 0 &&
      latestSearchSnapshots.length > 0 &&
      !isListingObservedInLatestSearches(listing.id, latestSearchSnapshots)
    ) {
      signals.push(
        buildSignal({
          ruleId: "listing-lost-competitive-context",
          projectId: context.project.id,
          listingId: listing.id,
          type: "OTHER",
          severity: "LOW",
          explanation: `La publicacion "${listing.title}" tiene cambios registrados, pero no aparece vinculada en los snapshots competitivos recientes del proyecto. Puede necesitar contexto competitivo antes de decidir la proxima accion.`,
          now,
        }),
      );
    }
  }

  return signals;
}

type BuildSignalInput = {
  ruleId: string;
  projectId: string;
  listingId?: string | null;
  trackedSearchId?: string | null;
  type: OpportunityTypeValue;
  severity: OpportunitySeverityValue;
  explanation: string;
  now: Date;
};

function buildSignal(input: BuildSignalInput): OpportunitySignalCandidate {
  return {
    ruleId: input.ruleId,
    projectId: input.projectId,
    listingId: input.listingId ?? null,
    trackedSearchId: input.trackedSearchId ?? null,
    type: input.type,
    severity: input.severity,
    explanation: input.explanation,
    detectedAt: input.now,
  };
}

type SearchPresence = {
  totalResults: number;
  ownCount: number;
  ownTop5Count: number;
  ownTop10Count: number;
  firstOwnListingId: string | null;
  competitors: OwnerAppearance[];
};

type OwnerAppearance = {
  key: string;
  label: string;
  count: number;
  top5Count: number;
  top10Count: number;
  positions: number[];
};

function buildSearchPresence(results: OpportunitySearchResultContext[]): SearchPresence {
  const competitors = new Map<string, OwnerAppearance>();
  let ownCount = 0;
  let ownTop5Count = 0;
  let ownTop10Count = 0;
  let firstOwnListingId: string | null = null;

  for (const result of sortSearchResults(results)) {
    if (result.isOwnListing || result.ownListingId) {
      ownCount += 1;
      firstOwnListingId ??= result.ownListingId;
      if (result.position <= 5) {
        ownTop5Count += 1;
      }
      if (result.position <= 10) {
        ownTop10Count += 1;
      }
      continue;
    }

    const owner = getCompetitorIdentity(result);
    if (!owner) {
      continue;
    }

    const current = competitors.get(owner.key) ?? {
      ...owner,
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

    competitors.set(owner.key, current);
  }

  return {
    totalResults: results.length,
    ownCount,
    ownTop5Count,
    ownTop10Count,
    firstOwnListingId,
    competitors: Array.from(competitors.values()).sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return Math.min(...left.positions) - Math.min(...right.positions);
    }),
  };
}

function isLowOwnPresence(presence: SearchPresence) {
  if (presence.totalResults < 4 || presence.ownCount === 0) {
    return false;
  }

  return presence.ownCount / presence.totalResults <= 0.25;
}

function findConcentratedCompetitor(presence: SearchPresence) {
  if (presence.totalResults < 4) {
    return null;
  }

  return (
    presence.competitors.find((competitor) => {
      const share = competitor.count / presence.totalResults;
      return competitor.count >= 2 && share >= 0.4;
    }) ?? null
  );
}

function findVisiblePriceGap(results: OpportunitySearchResultContext[]) {
  const pricedResults = sortSearchResults(results)
    .filter((result) => result.observedPrice !== null && result.observedPrice > 0)
    .map((result) => ({
      price: result.observedPrice as number,
      position: result.position,
    }))
    .sort((left, right) => left.price - right.price);

  let largestGap: { lowerPrice: number; upperPrice: number; ratio: number; absolute: number } | null =
    null;

  for (let index = 1; index < pricedResults.length; index += 1) {
    const lower = pricedResults[index - 1];
    const upper = pricedResults[index];
    const absolute = upper.price - lower.price;
    const ratio = lower.price === 0 ? 0 : absolute / lower.price;

    if (!largestGap || absolute > largestGap.absolute) {
      largestGap = {
        lowerPrice: lower.price,
        upperPrice: upper.price,
        ratio,
        absolute,
      };
    }
  }

  if (
    largestGap &&
    largestGap.absolute >= PRICE_GAP_MIN_ABSOLUTE &&
    largestGap.ratio >= PRICE_GAP_RATIO
  ) {
    return largestGap;
  }

  return null;
}

function findWeakCompetitorAvailability(results: OpportunitySearchResultContext[]) {
  return (
    sortSearchResults(results)
      .filter((result) => !(result.isOwnListing || result.ownListingId))
      .map((result) => ({
        label: result.competitorName ?? result.observedSellerName ?? result.observedTitle,
        text: `${result.visibleFlags ?? ""} ${result.notes ?? ""} ${result.observedTitle}`.toLowerCase(),
      }))
      .find((result) =>
        ["sin stock", "stock dudoso", "disponibilidad dudosa", "quiebre", "agotado"].some((term) =>
          result.text.includes(term),
        ),
      ) ?? null
  );
}

function findDisappearedCompetitors(previous: SearchPresence, latest: SearchPresence) {
  const latestKeys = new Set(latest.competitors.map((competitor) => competitor.key));
  return previous.competitors
    .filter((competitor) => competitor.top10Count > 0 && !latestKeys.has(competitor.key))
    .map((competitor) => competitor.label)
    .slice(0, 3);
}

function getCompetitorIdentity(result: OpportunitySearchResultContext) {
  if (result.competitorId) {
    return {
      key: `competitor:${result.competitorId}`,
      label: result.competitorName ?? result.observedSellerName ?? "Competidor sin nombre",
    };
  }

  if (result.observedSellerName) {
    return {
      key: `seller:${normalizeKey(result.observedSellerName)}`,
      label: result.observedSellerName,
    };
  }

  return null;
}

function hasFollowUpSnapshot(
  snapshots: OpportunityMetricSnapshotContext[],
  changeDate: Date,
) {
  const maxTime = changeDate.getTime() + FOLLOW_UP_WINDOW_DAYS * DAY_MS;

  return snapshots.some((snapshot) => {
    const snapshotTime = snapshot.snapshotDate.getTime();
    return snapshotTime > changeDate.getTime() && snapshotTime <= maxTime;
  });
}

function findSnapshotBefore(snapshots: OpportunityMetricSnapshotContext[], date: Date) {
  return (
    snapshots
      .filter((snapshot) => snapshot.snapshotDate.getTime() <= date.getTime())
      .sort((left, right) => right.snapshotDate.getTime() - left.snapshotDate.getTime())[0] ?? null
  );
}

function hasVisibleImprovement(
  before: OpportunityMetricSnapshotContext,
  after: OpportunityMetricSnapshotContext,
) {
  return (
    isMetricUp(before.salesUnits, after.salesUnits, 1, 0.12) ||
    isMetricUp(before.conversionRate, after.conversionRate, 0.5, 0.08) ||
    isMetricUp(before.visits, after.visits, 15, 0.15)
  );
}

function hasWeakImprovement(
  before: OpportunityMetricSnapshotContext,
  after: OpportunityMetricSnapshotContext,
) {
  const salesDelta = numericDelta(before.salesUnits, after.salesUnits);
  const conversionDelta = numericDelta(before.conversionRate, after.conversionRate);
  const visitsDelta = numericDelta(before.visits, after.visits);

  return (
    (salesDelta !== null && salesDelta >= 0 && salesDelta <= 1) ||
    (conversionDelta !== null && conversionDelta > 0 && conversionDelta < 0.5) ||
    (visitsDelta !== null && visitsDelta > 0 && visitsDelta < 15)
  );
}

function hasVisibleDrop(
  before: OpportunityMetricSnapshotContext,
  after: OpportunityMetricSnapshotContext,
) {
  return (
    isMetricDown(before.salesUnits, after.salesUnits, 1, 0.12) ||
    isMetricDown(before.conversionRate, after.conversionRate, 0.5, 0.08) ||
    isMetricDown(before.visits, after.visits, 15, 0.15)
  );
}

function isStagnant(
  before: OpportunityMetricSnapshotContext,
  after: OpportunityMetricSnapshotContext,
) {
  const salesDelta = numericDelta(before.salesUnits, after.salesUnits);
  const conversionDelta = numericDelta(before.conversionRate, after.conversionRate);
  const visitsRatio = ratioDelta(before.visits, after.visits);

  return (
    (salesDelta === null || Math.abs(salesDelta) <= 0) &&
    (conversionDelta === null || Math.abs(conversionDelta) < 0.3) &&
    (visitsRatio === null || Math.abs(visitsRatio) < 0.1)
  );
}

function isListingObservedInLatestSearches(
  listingId: string,
  snapshots: OpportunitySearchSnapshotContext[],
) {
  return snapshots.some((snapshot) =>
    snapshot.results.some((result) => result.ownListingId === listingId),
  );
}

function isMetricUp(
  beforeValue: number | null,
  afterValue: number | null,
  minAbsolute: number,
  minRatio: number,
) {
  const absolute = numericDelta(beforeValue, afterValue);
  const ratio = ratioDelta(beforeValue, afterValue);

  if (absolute === null) {
    return false;
  }

  return absolute >= minAbsolute || (ratio ?? 0) >= minRatio;
}

function isMetricDown(
  beforeValue: number | null,
  afterValue: number | null,
  minAbsolute: number,
  minRatio: number,
) {
  const absolute = numericDelta(beforeValue, afterValue);
  const ratio = ratioDelta(beforeValue, afterValue);

  if (absolute === null) {
    return false;
  }

  return absolute <= -minAbsolute || (ratio ?? 0) <= -minRatio;
}

function numericDelta(beforeValue: number | null, afterValue: number | null) {
  if (beforeValue === null || afterValue === null) {
    return null;
  }

  return afterValue - beforeValue;
}

function ratioDelta(beforeValue: number | null, afterValue: number | null) {
  if (beforeValue === null || afterValue === null || beforeValue === 0) {
    return null;
  }

  return (afterValue - beforeValue) / Math.abs(beforeValue);
}

function sortMetricSnapshots(snapshots: OpportunityMetricSnapshotContext[]) {
  return [...snapshots].sort((left, right) => left.snapshotDate.getTime() - right.snapshotDate.getTime());
}

function sortChanges(changes: OpportunityChangeEventContext[]) {
  return [...changes].sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
}

function sortSearchSnapshots(snapshots: OpportunitySearchSnapshotContext[]) {
  return [...snapshots].sort((left, right) => left.capturedAt.getTime() - right.capturedAt.getTime());
}

function sortSearchResults(results: OpportunitySearchResultContext[]) {
  return [...results].sort((left, right) => left.position - right.position);
}

function dedupeSignals(signals: OpportunitySignalCandidate[]) {
  const seen = new Set<string>();
  const uniqueSignals: OpportunitySignalCandidate[] = [];

  for (const signal of signals) {
    const key = [
      signal.ruleId,
      signal.projectId,
      signal.listingId ?? "",
      signal.trackedSearchId ?? "",
      signal.type,
      signal.explanation,
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueSignals.push(signal);
  }

  return uniqueSignals;
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function daysBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / DAY_MS;
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function joinLabels(labels: string[]) {
  if (labels.length <= 1) {
    return labels[0] ?? "un competidor";
  }

  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}
