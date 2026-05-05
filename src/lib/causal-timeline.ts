type ChangeEventTypeValue =
  | "PRICE_UPDATE"
  | "TITLE_UPDATE"
  | "IMAGE_UPDATE"
  | "DESCRIPTION_UPDATE"
  | "PROMOTION_UPDATE"
  | "STOCK_UPDATE"
  | "ADS_UPDATE"
  | "SHIPPING_UPDATE"
  | "CATALOG_UPDATE"
  | "STATUS_UPDATE"
  | "OTHER";

export type TimelineChangeInput = {
  id: string;
  occurredAt: Date;
  type: ChangeEventTypeValue | string;
  detail: string;
  previousValue: string | null;
  newValue: string | null;
  comment: string | null;
  actorName: string | null;
  hypothesis: string | null;
};

export type TimelineSnapshotInput = {
  id: string;
  snapshotDate: Date;
  visits: number | null;
  salesUnits: number | null;
  conversionRate: number | null;
  revenue: number | null;
  availableStock: number | null;
  price: number | null;
  adSpend: number | null;
  notes: string | null;
};

export type ListingTimelineItem =
  | {
      kind: "change";
      id: string;
      date: Date;
      eventType: string;
      detail: string;
      previousValue: string | null;
      newValue: string | null;
      comment: string | null;
      actorName: string | null;
      hypothesis: string | null;
    }
  | {
      kind: "snapshot";
      id: string;
      date: Date;
      visits: number | null;
      salesUnits: number | null;
      conversionRate: number | null;
      revenue: number | null;
      availableStock: number | null;
      price: number | null;
      adSpend: number | null;
      notes: string | null;
    };

export type MetricDelta = {
  key:
    | "visits"
    | "salesUnits"
    | "conversionRate"
    | "revenue"
    | "availableStock"
    | "price"
    | "adSpend";
  label: string;
  unit: "number" | "percent" | "currency";
  firstValue: number | null;
  lastValue: number | null;
  absoluteDelta: number | null;
  percentDelta: number | null;
  direction: "up" | "down" | "flat" | "unknown";
};

export type ListingMetricSummary = {
  snapshotCount: number;
  changeCount: number;
  latestDataAt: Date | null;
  latestSnapshot: TimelineSnapshotInput | null;
  firstSnapshot: TimelineSnapshotInput | null;
  variations: MetricDelta[];
};

export type HeuristicInsightCategory = "probable" | "posible" | "mixta" | "no concluyente";
export type HeuristicInsightConfidence = "LOW" | "MEDIUM" | "HIGH";

export type HeuristicInsight = {
  id: string;
  category: HeuristicInsightCategory;
  confidence: HeuristicInsightConfidence;
  title: string;
  summary: string;
  evidence: string[];
  relatedChangeIds: string[];
  windowStart: Date | null;
  windowEnd: Date | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CLUSTER_MAX_GAP_DAYS = 2;
const IMPACT_WINDOW_DAYS = 14;
const MAX_HEURISTIC_READINGS = 5;

const changeTypeNames: Record<string, string> = {
  PRICE_UPDATE: "precio",
  TITLE_UPDATE: "titulo",
  IMAGE_UPDATE: "imagenes",
  DESCRIPTION_UPDATE: "descripcion",
  PROMOTION_UPDATE: "promocion",
  STOCK_UPDATE: "stock",
  ADS_UPDATE: "ads",
  SHIPPING_UPDATE: "envio",
  CATALOG_UPDATE: "catalogo",
  STATUS_UPDATE: "estado",
  OTHER: "otro",
};

export function buildListingTimeline(input: {
  changes: TimelineChangeInput[];
  snapshots: TimelineSnapshotInput[];
}): ListingTimelineItem[] {
  const changeItems: ListingTimelineItem[] = input.changes.map((change) => ({
    kind: "change",
    id: change.id,
    date: change.occurredAt,
    eventType: change.type,
    detail: change.detail,
    previousValue: change.previousValue,
    newValue: change.newValue,
    comment: change.comment,
    actorName: change.actorName,
    hypothesis: change.hypothesis,
  }));

  const snapshotItems: ListingTimelineItem[] = input.snapshots.map((snapshot) => ({
    kind: "snapshot",
    id: snapshot.id,
    date: snapshot.snapshotDate,
    visits: snapshot.visits,
    salesUnits: snapshot.salesUnits,
    conversionRate: snapshot.conversionRate,
    revenue: snapshot.revenue,
    availableStock: snapshot.availableStock,
    price: snapshot.price,
    adSpend: snapshot.adSpend,
    notes: snapshot.notes,
  }));

  return [...changeItems, ...snapshotItems].sort((left, right) => {
    const dateDiff = left.date.getTime() - right.date.getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return left.kind === "change" ? -1 : 1;
  });
}

export function buildListingMetricSummary(input: {
  changes: TimelineChangeInput[];
  snapshots: TimelineSnapshotInput[];
}): ListingMetricSummary {
  const snapshots = sortSnapshots(input.snapshots);
  const firstSnapshot = snapshots[0] ?? null;
  const latestSnapshot = snapshots[snapshots.length - 1] ?? null;

  return {
    snapshotCount: input.snapshots.length,
    changeCount: input.changes.length,
    latestDataAt: latestSnapshot?.snapshotDate ?? null,
    latestSnapshot,
    firstSnapshot,
    variations:
      firstSnapshot && latestSnapshot
        ? buildMetricDeltas(firstSnapshot, latestSnapshot)
        : buildMetricDeltas(null, null),
  };
}

export function generateListingHeuristicInsights(input: {
  changes: TimelineChangeInput[];
  snapshots: TimelineSnapshotInput[];
}): HeuristicInsight[] {
  const changes = sortChanges(input.changes);
  const snapshots = sortSnapshots(input.snapshots);

  if (snapshots.length < 2) {
    return [
      {
        id: "insight-no-snapshots",
        category: "no concluyente",
        confidence: "LOW",
        title: "Sin evidencia suficiente",
        summary:
          changes.length > 0
            ? "Hay cambios registrados, pero faltan snapshots metricos suficientes para comparar un antes y un despues."
            : "Todavia faltan snapshots metricos y cambios propios para construir una lectura operativa defendible.",
        evidence: [`Snapshots disponibles: ${snapshots.length}`],
        relatedChangeIds: [],
        windowStart: null,
        windowEnd: null,
      },
    ];
  }

  if (changes.length === 0) {
    return [buildExternalVariationInsight(snapshots)];
  }

  const clusters = groupNearbyChanges(changes);
  const readings = clusters
    .map((cluster, index) => buildClusterInsight(cluster, snapshots, index))
    .filter((reading): reading is HeuristicInsight => reading !== null);

  if (readings.length === 0) {
    return [
      {
        id: "insight-no-clear-reading",
        category: "no concluyente",
        confidence: "LOW",
        title: "Lectura no concluyente",
        summary:
          "Existen cambios y snapshots, pero las ventanas disponibles no muestran una variacion clara que convenga atribuir a una accion propia.",
        evidence: [
          `Cambios registrados: ${changes.length}`,
          `Snapshots disponibles: ${snapshots.length}`,
        ],
        relatedChangeIds: [],
        windowStart: snapshots[0]?.snapshotDate ?? null,
        windowEnd: snapshots[snapshots.length - 1]?.snapshotDate ?? null,
      },
    ];
  }

  const hasConclusiveReading = readings.some((reading) => reading.category !== "no concluyente");
  if (!hasConclusiveReading) {
    return readings.slice(0, MAX_HEURISTIC_READINGS);
  }

  return readings
    .filter((reading) => reading.category !== "no concluyente")
    .slice(0, MAX_HEURISTIC_READINGS);
}

function buildClusterInsight(
  cluster: ChangeCluster,
  snapshots: TimelineSnapshotInput[],
  index: number,
): HeuristicInsight | null {
  const before = findSnapshotBefore(snapshots, cluster.start);
  const after = findSnapshotAfter(snapshots, cluster.end, IMPACT_WINDOW_DAYS);
  const relatedChangeIds = cluster.changes.map((change) => change.id);
  const id = `insight-cluster-${index + 1}`;
  const typeNames = describeChangeTypes(cluster.changes);

  if (!before || !after) {
    return {
      id,
      category: "no concluyente",
      confidence: "LOW",
      title: "Cambio sin ventana completa",
      summary: `Hay cambios de ${typeNames}, pero falta un snapshot antes o despues dentro de una ventana razonable para leer impacto.`,
      evidence: buildWindowEvidence(before, after, []),
      relatedChangeIds,
      windowStart: before?.snapshotDate ?? cluster.start,
      windowEnd: after?.snapshotDate ?? cluster.end,
    };
  }

  const deltas = buildMetricDeltas(before, after);
  const evidence = buildWindowEvidence(before, after, deltas);
  const performanceImproved = isMetricUp(deltas, "salesUnits") || isMetricUp(deltas, "conversionRate");
  const performanceDropped = isMetricDown(deltas, "salesUnits") || isMetricDown(deltas, "conversionRate");
  const trafficImproved = isMetricUp(deltas, "visits");
  const stockDropped = isMetricDown(deltas, "availableStock");
  const stockImproved = hasStockIncrease(cluster.changes) || isMetricUp(deltas, "availableStock");
  const priceDirection = getPriceDirection(cluster.changes);
  const adSpendIncreased = isMetricUp(deltas, "adSpend");

  if (cluster.changes.length > 1) {
    if (performanceImproved || performanceDropped || trafficImproved) {
      const directionText = performanceDropped ? "deterioro posterior" : "mejora posterior";
      return {
        id,
        category: "mixta",
        confidence: confidenceFromEvidence(deltas, "MEDIUM"),
        title: "Lectura mixta por cambios cercanos",
        summary: `Hubo varios cambios de ${typeNames} muy juntos y luego aparece ${directionText}. La lectura es util, pero no conviene asignarla a una sola accion.`,
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }

    return {
      id,
      category: "no concluyente",
      confidence: "LOW",
      title: "Cambios cercanos sin senal clara",
      summary: `Los cambios de ${typeNames} quedaron muy juntos y la ventana posterior no muestra una variacion suficientemente clara.`,
      evidence,
      relatedChangeIds,
      windowStart: before.snapshotDate,
      windowEnd: after.snapshotDate,
    };
  }

  const change = cluster.changes[0];

  if (change.type === "PRICE_UPDATE") {
    if (performanceImproved) {
      return {
        id,
        category: "probable",
        confidence: confidenceFromEvidence(deltas, "MEDIUM"),
        title: "Impacto positivo probable del cambio de precio",
        summary: `${describePriceDirection(priceDirection)} y despues mejoraron ventas o conversion dentro de la ventana observada. La atribucion es prudente porque pueden existir otros factores no cargados.`,
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }

    if (performanceDropped) {
      return {
        id,
        category: "posible",
        confidence: "LOW",
        title: "Posible impacto negativo del cambio de precio",
        summary: `${describePriceDirection(priceDirection)} y despues cayeron ventas o conversion. La evidencia alcanza para revisar el cambio, no para afirmar causalidad.`,
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }
  }

  if (change.type === "STOCK_UPDATE") {
    if ((hasStockBreak(change) || stockDropped) && performanceDropped) {
      return {
        id,
        category: "probable",
        confidence: "MEDIUM",
        title: "Impacto probable por stock",
        summary:
          "El cambio de stock o disponibilidad queda cerca de una caida de ventas o conversion. Conviene revisar quiebres, continuidad y stock visible.",
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }

    if (stockImproved && performanceImproved) {
      return {
        id,
        category: "posible",
        confidence: "MEDIUM",
        title: "Posible mejora por disponibilidad",
        summary:
          "La mejora posterior coincide con una reposicion o mejora de stock. Es una lectura operativa util, aunque puede estar mezclada con demanda o competencia no observada.",
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }
  }

  if (change.type === "PROMOTION_UPDATE" || change.type === "ADS_UPDATE") {
    if (trafficImproved && (performanceImproved || adSpendIncreased)) {
      return {
        id,
        category: performanceImproved ? "probable" : "posible",
        confidence: performanceImproved ? "MEDIUM" : "LOW",
        title: "Mejora posiblemente vinculada a promo o ads",
        summary:
          "Luego del cambio se ve mejora de visitas y alguna senal comercial. La lectura es prudente porque la inversion y el contexto tambien pueden haber influido.",
        evidence,
        relatedChangeIds,
        windowStart: before.snapshotDate,
        windowEnd: after.snapshotDate,
      };
    }
  }

  if (performanceImproved || performanceDropped || trafficImproved) {
    return {
      id,
      category: "posible",
      confidence: "LOW",
      title: "Variacion posterior a un cambio propio",
      summary: `El cambio de ${typeNames} queda cerca de una variacion observable, pero la evidencia todavia es debil para una atribucion fuerte.`,
      evidence,
      relatedChangeIds,
      windowStart: before.snapshotDate,
      windowEnd: after.snapshotDate,
    };
  }

  return {
    id,
    category: "no concluyente",
    confidence: "LOW",
    title: "Sin senal posterior suficiente",
    summary: `El cambio de ${typeNames} tiene snapshots antes y despues, pero no aparece una mejora o caida suficientemente visible.`,
    evidence,
    relatedChangeIds,
    windowStart: before.snapshotDate,
    windowEnd: after.snapshotDate,
  };
}

function buildExternalVariationInsight(snapshots: TimelineSnapshotInput[]): HeuristicInsight {
  const first = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const deltas = buildMetricDeltas(first, latest);
  const hasMeaningfulMove =
    isMetricUp(deltas, "salesUnits") ||
    isMetricDown(deltas, "salesUnits") ||
    isMetricUp(deltas, "conversionRate") ||
    isMetricDown(deltas, "conversionRate") ||
    isMetricUp(deltas, "visits") ||
    isMetricDown(deltas, "visits");

  if (!hasMeaningfulMove) {
    return {
      id: "insight-no-changes-flat",
      category: "no concluyente",
      confidence: "LOW",
      title: "Sin cambios propios ni variacion fuerte",
      summary:
        "No hay cambios propios registrados y la variacion entre snapshots no muestra una senal operativa clara.",
      evidence: buildWindowEvidence(first, latest, deltas),
      relatedChangeIds: [],
      windowStart: first.snapshotDate,
      windowEnd: latest.snapshotDate,
    };
  }

  return {
    id: "insight-external-variation",
    category: "posible",
    confidence: "LOW",
    title: "Posible influencia externa o contexto no observado",
    summary:
      "Hay variaciones metricas sin cambios propios cercanos. Puede haber influido competencia, estacionalidad, ads externos a la bitacora u otro contexto todavia no cargado.",
    evidence: buildWindowEvidence(first, latest, deltas),
    relatedChangeIds: [],
    windowStart: first.snapshotDate,
    windowEnd: latest.snapshotDate,
  };
}

type ChangeCluster = {
  start: Date;
  end: Date;
  changes: TimelineChangeInput[];
};

function groupNearbyChanges(changes: TimelineChangeInput[]): ChangeCluster[] {
  return changes.reduce<ChangeCluster[]>((clusters, change) => {
    const lastCluster = clusters[clusters.length - 1];
    if (!lastCluster) {
      clusters.push({ start: change.occurredAt, end: change.occurredAt, changes: [change] });
      return clusters;
    }

    const gapDays = (change.occurredAt.getTime() - lastCluster.end.getTime()) / DAY_MS;
    if (gapDays <= CLUSTER_MAX_GAP_DAYS) {
      lastCluster.end = change.occurredAt;
      lastCluster.changes.push(change);
      return clusters;
    }

    clusters.push({ start: change.occurredAt, end: change.occurredAt, changes: [change] });
    return clusters;
  }, []);
}

function buildMetricDeltas(
  first: TimelineSnapshotInput | null,
  latest: TimelineSnapshotInput | null,
): MetricDelta[] {
  return [
    buildMetricDelta("visits", "Visitas", "number", first?.visits ?? null, latest?.visits ?? null),
    buildMetricDelta(
      "salesUnits",
      "Ventas",
      "number",
      first?.salesUnits ?? null,
      latest?.salesUnits ?? null,
    ),
    buildMetricDelta(
      "conversionRate",
      "Conversion",
      "percent",
      first?.conversionRate ?? null,
      latest?.conversionRate ?? null,
    ),
    buildMetricDelta("revenue", "Facturacion", "currency", first?.revenue ?? null, latest?.revenue ?? null),
    buildMetricDelta(
      "availableStock",
      "Stock",
      "number",
      first?.availableStock ?? null,
      latest?.availableStock ?? null,
    ),
    buildMetricDelta("price", "Precio", "currency", first?.price ?? null, latest?.price ?? null),
    buildMetricDelta(
      "adSpend",
      "Gasto ads",
      "currency",
      first?.adSpend ?? null,
      latest?.adSpend ?? null,
    ),
  ];
}

function buildMetricDelta(
  key: MetricDelta["key"],
  label: string,
  unit: MetricDelta["unit"],
  firstValue: number | null,
  lastValue: number | null,
): MetricDelta {
  if (firstValue === null || lastValue === null) {
    return {
      key,
      label,
      unit,
      firstValue,
      lastValue,
      absoluteDelta: null,
      percentDelta: null,
      direction: "unknown",
    };
  }

  const absoluteDelta = lastValue - firstValue;
  const percentDelta = firstValue === 0 ? null : absoluteDelta / Math.abs(firstValue);

  return {
    key,
    label,
    unit,
    firstValue,
    lastValue,
    absoluteDelta,
    percentDelta,
    direction: Math.abs(absoluteDelta) < 0.0001 ? "flat" : absoluteDelta > 0 ? "up" : "down",
  };
}

function buildWindowEvidence(
  before: TimelineSnapshotInput | null,
  after: TimelineSnapshotInput | null,
  deltas: MetricDelta[],
) {
  const evidence: string[] = [];

  if (before) {
    evidence.push(`Antes: snapshot ${toIsoDate(before.snapshotDate)}`);
  }

  if (after) {
    evidence.push(`Despues: snapshot ${toIsoDate(after.snapshotDate)}`);
  }

  const relevantDeltas = deltas.filter((delta) =>
    ["visits", "salesUnits", "conversionRate", "availableStock", "price"].includes(delta.key),
  );

  for (const delta of relevantDeltas) {
    if (delta.absoluteDelta !== null && delta.direction !== "flat") {
      evidence.push(`${delta.label}: ${formatDeltaForEvidence(delta)}`);
    }
  }

  return evidence;
}

function formatDeltaForEvidence(delta: MetricDelta) {
  const sign = delta.absoluteDelta && delta.absoluteDelta > 0 ? "+" : "";
  const roundedDelta =
    delta.unit === "percent"
      ? `${sign}${round(delta.absoluteDelta ?? 0)} pp`
      : `${sign}${round(delta.absoluteDelta ?? 0)}`;

  if (delta.percentDelta === null || delta.unit === "percent") {
    return roundedDelta;
  }

  const pctSign = delta.percentDelta > 0 ? "+" : "";
  return `${roundedDelta} (${pctSign}${round(delta.percentDelta * 100)}%)`;
}

function isMetricUp(deltas: MetricDelta[], key: MetricDelta["key"]) {
  const delta = deltas.find((item) => item.key === key);
  if (!delta || delta.absoluteDelta === null) {
    return false;
  }

  if (key === "conversionRate") {
    return delta.absoluteDelta >= 0.3;
  }

  if (key === "salesUnits") {
    return delta.absoluteDelta >= 1;
  }

  if (key === "visits") {
    return delta.absoluteDelta >= 10 || (delta.percentDelta ?? 0) >= 0.1;
  }

  if (key === "availableStock") {
    return delta.absoluteDelta >= 1;
  }

  return (delta.percentDelta ?? 0) >= 0.1 || delta.absoluteDelta > 0;
}

function isMetricDown(deltas: MetricDelta[], key: MetricDelta["key"]) {
  const delta = deltas.find((item) => item.key === key);
  if (!delta || delta.absoluteDelta === null) {
    return false;
  }

  if (key === "conversionRate") {
    return delta.absoluteDelta <= -0.3;
  }

  if (key === "salesUnits") {
    return delta.absoluteDelta <= -1;
  }

  if (key === "visits") {
    return delta.absoluteDelta <= -10 || (delta.percentDelta ?? 0) <= -0.1;
  }

  if (key === "availableStock") {
    return delta.absoluteDelta <= -1;
  }

  return (delta.percentDelta ?? 0) <= -0.1 || delta.absoluteDelta < 0;
}

function confidenceFromEvidence(
  deltas: MetricDelta[],
  fallback: HeuristicInsightConfidence,
): HeuristicInsightConfidence {
  const salesUp = isMetricUp(deltas, "salesUnits");
  const conversionUp = isMetricUp(deltas, "conversionRate");
  const salesDown = isMetricDown(deltas, "salesUnits");
  const conversionDown = isMetricDown(deltas, "conversionRate");

  if ((salesUp && conversionUp) || (salesDown && conversionDown)) {
    return "HIGH";
  }

  if (salesUp || conversionUp || salesDown || conversionDown) {
    return "MEDIUM";
  }

  return fallback;
}

function findSnapshotBefore(snapshots: TimelineSnapshotInput[], date: Date) {
  let candidate: TimelineSnapshotInput | null = null;

  for (const snapshot of snapshots) {
    if (snapshot.snapshotDate.getTime() <= date.getTime()) {
      candidate = snapshot;
      continue;
    }

    break;
  }

  return candidate;
}

function findSnapshotAfter(snapshots: TimelineSnapshotInput[], date: Date, windowDays: number) {
  const maxTime = date.getTime() + windowDays * DAY_MS;
  let candidate: TimelineSnapshotInput | null = null;

  for (const snapshot of snapshots) {
    const snapshotTime = snapshot.snapshotDate.getTime();
    if (snapshotTime > date.getTime() && snapshotTime <= maxTime) {
      candidate = snapshot;
    }
  }

  return candidate;
}

function sortChanges(changes: TimelineChangeInput[]) {
  return [...changes].sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
}

function sortSnapshots(snapshots: TimelineSnapshotInput[]) {
  return [...snapshots].sort((left, right) => left.snapshotDate.getTime() - right.snapshotDate.getTime());
}

function describeChangeTypes(changes: TimelineChangeInput[]) {
  const uniqueNames = Array.from(new Set(changes.map((change) => changeTypeNames[change.type] ?? "otro")));

  if (uniqueNames.length === 1) {
    return uniqueNames[0];
  }

  return uniqueNames.slice(0, -1).join(", ") + " y " + uniqueNames[uniqueNames.length - 1];
}

function parseNumericValue(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPriceDirection(changes: TimelineChangeInput[]) {
  const priceChange = changes.find((change) => change.type === "PRICE_UPDATE");
  if (!priceChange) {
    return "unknown" as const;
  }

  const previous = parseNumericValue(priceChange.previousValue);
  const next = parseNumericValue(priceChange.newValue);
  if (previous === null || next === null) {
    return "unknown" as const;
  }

  if (next < previous) {
    return "down" as const;
  }

  if (next > previous) {
    return "up" as const;
  }

  return "flat" as const;
}

function describePriceDirection(direction: ReturnType<typeof getPriceDirection>) {
  if (direction === "down") {
    return "Hubo una baja de precio";
  }

  if (direction === "up") {
    return "Hubo una suba de precio";
  }

  return "Hubo un cambio de precio";
}

function hasStockBreak(change: TimelineChangeInput) {
  const next = parseNumericValue(change.newValue);
  const text = `${change.detail} ${change.comment ?? ""} ${change.newValue ?? ""}`.toLowerCase();
  return next === 0 || text.includes("sin stock") || text.includes("quiebre");
}

function hasStockIncrease(changes: TimelineChangeInput[]) {
  return changes.some((change) => {
    if (change.type !== "STOCK_UPDATE") {
      return false;
    }

    const previous = parseNumericValue(change.previousValue);
    const next = parseNumericValue(change.newValue);
    return previous !== null && next !== null && next > previous;
  });
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
