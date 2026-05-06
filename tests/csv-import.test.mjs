import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(relativePath);
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  const cjsModule = { exports: {} };

  vm.runInNewContext(
    outputText,
    {
      exports: cjsModule.exports,
      module: cjsModule,
      require,
    },
    { filename },
  );

  return cjsModule.exports;
}

function test(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const { suggestMetricMapping } = loadTypeScriptModule("src/lib/csv/metric-mapping.ts");
const { parseCsv } = loadTypeScriptModule("src/lib/csv/parser.ts");
const {
  buildListingTimeline,
  generateListingHeuristicInsights,
} = loadTypeScriptModule("src/lib/causal-timeline.ts");
const {
  buildShelfPresence,
  compareSearchSnapshots,
} = loadTypeScriptModule("src/lib/search-snapshot-comparison.ts");
const {
  generateOpportunitySignalCandidates,
} = loadTypeScriptModule("src/lib/opportunity-rules.ts");

test("parseCsv supports quoted semicolon CSV rows", () => {
  const parsed = parseCsv(
    'publicacion;fecha;visitas;notas\n"TERM-INOX-1L";22/04/2026;"1.234";"nota; con separador"',
  );

  assert.equal(parsed.delimiter, ";");
  assert.deepEqual(Array.from(parsed.headers), ["publicacion", "fecha", "visitas", "notas"]);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].values.visitas, "1.234");
  assert.equal(parsed.rows[0].values.notas, "nota; con separador");
});

test("suggestMetricMapping resolves alternative metric headers", () => {
  const mapping = suggestMetricMapping([
    "publicacion",
    "fecha",
    "visitas",
    "ventas",
    "facturacion",
    "conversion",
    "publicidad",
  ]);

  assert.equal(mapping.listingKey, "publicacion");
  assert.equal(mapping.date, "fecha");
  assert.equal(mapping.visits, "visitas");
  assert.equal(mapping.sales, "ventas");
  assert.equal(mapping.revenue, "facturacion");
  assert.equal(mapping.conversion, "conversion");
  assert.equal(mapping.adSpend, "publicidad");
});

test("buildListingTimeline combines changes and metric snapshots chronologically", () => {
  const timeline = buildListingTimeline({
    changes: [
      {
        id: "change-1",
        occurredAt: new Date("2026-04-10T12:00:00.000Z"),
        type: "PRICE_UPDATE",
        detail: "Baja de precio",
        previousValue: "100",
        newValue: "90",
        comment: null,
        actorName: null,
        hypothesis: null,
      },
    ],
    snapshots: [
      {
        id: "snapshot-1",
        snapshotDate: new Date("2026-04-09T00:00:00.000Z"),
        visits: 100,
        salesUnits: 5,
        conversionRate: 5,
        revenue: 500,
        availableStock: 20,
        price: 100,
        adSpend: 0,
        notes: null,
      },
      {
        id: "snapshot-2",
        snapshotDate: new Date("2026-04-12T00:00:00.000Z"),
        visits: 130,
        salesUnits: 8,
        conversionRate: 6.15,
        revenue: 720,
        availableStock: 12,
        price: 90,
        adSpend: 0,
        notes: null,
      },
    ],
  });

  assert.equal(timeline.map((item) => item.kind).join(","), "snapshot,change,snapshot");
});

test("generateListingHeuristicInsights marks nearby changes as mixed attribution", () => {
  const insights = generateListingHeuristicInsights({
    changes: [
      {
        id: "price-change",
        occurredAt: new Date("2026-04-10T12:00:00.000Z"),
        type: "PRICE_UPDATE",
        detail: "Baja de precio",
        previousValue: "100",
        newValue: "90",
        comment: null,
        actorName: null,
        hypothesis: null,
      },
      {
        id: "title-change",
        occurredAt: new Date("2026-04-11T12:00:00.000Z"),
        type: "TITLE_UPDATE",
        detail: "Ajuste de titulo",
        previousValue: null,
        newValue: null,
        comment: null,
        actorName: null,
        hypothesis: null,
      },
    ],
    snapshots: [
      {
        id: "before",
        snapshotDate: new Date("2026-04-09T00:00:00.000Z"),
        visits: 100,
        salesUnits: 5,
        conversionRate: 5,
        revenue: 500,
        availableStock: 20,
        price: 100,
        adSpend: 0,
        notes: null,
      },
      {
        id: "after",
        snapshotDate: new Date("2026-04-15T00:00:00.000Z"),
        visits: 140,
        salesUnits: 8,
        conversionRate: 5.71,
        revenue: 720,
        availableStock: 12,
        price: 90,
        adSpend: 0,
        notes: null,
      },
    ],
  });

  assert.equal(insights[0].category, "mixta");
  assert.equal(insights[0].confidence, "HIGH");
});

test("generateListingHeuristicInsights stays inconclusive without posterior snapshots", () => {
  const insights = generateListingHeuristicInsights({
    changes: [
      {
        id: "price-change",
        occurredAt: new Date("2026-04-10T12:00:00.000Z"),
        type: "PRICE_UPDATE",
        detail: "Baja de precio",
        previousValue: "100",
        newValue: "90",
        comment: null,
        actorName: null,
        hypothesis: null,
      },
    ],
    snapshots: [
      {
        id: "before-1",
        snapshotDate: new Date("2026-04-06T00:00:00.000Z"),
        visits: 90,
        salesUnits: 4,
        conversionRate: 4.4,
        revenue: 400,
        availableStock: 22,
        price: 100,
        adSpend: 0,
        notes: null,
      },
      {
        id: "before-2",
        snapshotDate: new Date("2026-04-09T00:00:00.000Z"),
        visits: 100,
        salesUnits: 5,
        conversionRate: 5,
        revenue: 500,
        availableStock: 20,
        price: 100,
        adSpend: 0,
        notes: null,
      },
    ],
  });

  assert.equal(insights[0].category, "no concluyente");
  assert.equal(insights[0].confidence, "LOW");
});

test("buildShelfPresence counts own and competitor visibility", () => {
  const presence = buildShelfPresence({
    id: "snapshot-a",
    capturedAt: new Date("2026-04-20T12:00:00.000Z"),
    results: [
      makeSearchResult({ id: "1", position: 1, competitorId: "north", seller: "Outdoor North" }),
      makeSearchResult({ id: "2", position: 2, isOwnListing: true, ownListingId: "own-1" }),
      makeSearchResult({ id: "3", position: 8, competitorId: "north", seller: "Outdoor North" }),
      makeSearchResult({ id: "4", position: 11, seller: "Pampa Gear" }),
    ],
  });

  assert.equal(presence.totalResults, 4);
  assert.equal(presence.ownCount, 1);
  assert.equal(presence.competitorCount, 3);
  assert.equal(presence.ownPresentTop5, true);
  assert.equal(presence.ownPresentTop10, true);
  assert.equal(presence.competitorAppearances[0].label, "Outdoor North");
  assert.equal(presence.competitorAppearances[0].count, 2);
});

test("compareSearchSnapshots finds new competitors and price changes", () => {
  const before = {
    id: "snapshot-before",
    capturedAt: new Date("2026-04-20T12:00:00.000Z"),
    results: [
      makeSearchResult({
        id: "before-1",
        position: 1,
        competitorId: "north",
        externalListingId: "MLA-NORTH-1",
        seller: "Outdoor North",
        price: 40000,
      }),
      makeSearchResult({
        id: "before-2",
        position: 4,
        isOwnListing: true,
        ownListingId: "own-1",
        price: 39000,
      }),
    ],
  };
  const after = {
    id: "snapshot-after",
    capturedAt: new Date("2026-04-27T12:00:00.000Z"),
    results: [
      makeSearchResult({
        id: "after-1",
        position: 1,
        competitorId: "north",
        externalListingId: "MLA-NORTH-1",
        seller: "Outdoor North",
        price: 42000,
      }),
      makeSearchResult({
        id: "after-2",
        position: 2,
        competitorId: "ruta",
        seller: "Ruta Camping",
        price: 41000,
      }),
    ],
  };

  const comparison = compareSearchSnapshots(before, after);

  assert.equal(comparison.before.ownPresentTop5, true);
  assert.equal(comparison.after.ownPresentTop5, false);
  assert.equal(comparison.newCompetitors.length, 1);
  assert.equal(comparison.newCompetitors[0].label, "Ruta Camping");
  assert.equal(comparison.priceChanges.length, 1);
  assert.equal(comparison.priceChanges[0].absoluteDelta, 2000);
});

test("generateOpportunitySignalCandidates flags absent own presence as high priority", () => {
  const signals = generateOpportunitySignalCandidates({
    now: new Date("2026-05-05T12:00:00.000Z"),
    context: makeOpportunityContext({
      trackedSearches: [
        makeTrackedSearch({
          id: "search-absent",
          snapshots: [
            {
              id: "snapshot-absent",
              capturedAt: new Date("2026-05-01T12:00:00.000Z"),
              results: [
                makeOpportunitySearchResult({
                  id: "r1",
                  position: 1,
                  seller: "Outdoor North",
                  competitorId: "north",
                  price: 40000,
                }),
                makeOpportunitySearchResult({
                  id: "r2",
                  position: 2,
                  seller: "Ruta Camping",
                  competitorId: "ruta",
                  price: 43000,
                }),
              ],
            },
          ],
        }),
      ],
    }),
  });

  const absentSignal = signals.find((signal) => signal.ruleId === "search-no-own-presence");

  assert.ok(absentSignal);
  assert.equal(absentSignal.type, "VISIBILITY_GAP");
  assert.equal(absentSignal.severity, "HIGH");
});

test("generateOpportunitySignalCandidates flags visible search price gaps", () => {
  const signals = generateOpportunitySignalCandidates({
    now: new Date("2026-05-05T12:00:00.000Z"),
    context: makeOpportunityContext({
      trackedSearches: [
        makeTrackedSearch({
          id: "search-price-gap",
          snapshots: [
            {
              id: "snapshot-price-gap",
              capturedAt: new Date("2026-05-01T12:00:00.000Z"),
              results: [
                makeOpportunitySearchResult({
                  id: "r1",
                  position: 1,
                  seller: "Outdoor North",
                  competitorId: "north",
                  price: 30000,
                }),
                makeOpportunitySearchResult({
                  id: "r2",
                  position: 2,
                  isOwnListing: true,
                  ownListingId: "listing-1",
                  price: 52000,
                }),
                makeOpportunitySearchResult({
                  id: "r3",
                  position: 3,
                  seller: "Pampa Gear",
                  competitorId: "pampa",
                  price: 54000,
                }),
              ],
            },
          ],
        }),
      ],
    }),
  });

  const priceSignal = signals.find((signal) => signal.ruleId === "search-visible-price-gap");

  assert.ok(priceSignal);
  assert.equal(priceSignal.type, "PRICE_GAP");
  assert.equal(priceSignal.severity, "MEDIUM");
});

test("generateOpportunitySignalCandidates flags changes without posterior tracking", () => {
  const signals = generateOpportunitySignalCandidates({
    now: new Date("2026-05-05T12:00:00.000Z"),
    context: makeOpportunityContext({
      listings: [
        {
          id: "listing-no-follow-up",
          title: "Publicacion sin seguimiento",
          metricSnapshots: [
            {
              id: "snapshot-before",
              snapshotDate: new Date("2026-04-20T00:00:00.000Z"),
              visits: 80,
              salesUnits: 4,
              conversionRate: 5,
            },
            {
              id: "snapshot-before-2",
              snapshotDate: new Date("2026-04-25T00:00:00.000Z"),
              visits: 82,
              salesUnits: 4,
              conversionRate: 4.88,
            },
          ],
          changeEvents: [
            {
              id: "change-after",
              occurredAt: new Date("2026-04-28T12:00:00.000Z"),
              type: "PRICE_UPDATE",
              detail: "Baja de precio",
            },
          ],
        },
      ],
    }),
  });

  const followUpSignal = signals.find(
    (signal) => signal.ruleId === "listing-change-without-follow-up",
  );

  assert.ok(followUpSignal);
  assert.equal(followUpSignal.type, "OTHER");
  assert.equal(followUpSignal.severity, "MEDIUM");
});

function makeSearchResult({
  id,
  position,
  isOwnListing = false,
  ownListingId = null,
  competitorId = null,
  externalListingId = null,
  seller = null,
  price = null,
}) {
  return {
    id,
    position,
    observedTitle: `${seller ?? "Publicacion propia"} ejemplo`,
    observedPrice: price,
    observedSellerName: seller,
    isOwnListing,
    competitorId,
    ownListingId,
    externalListingId,
    competitor: competitorId && seller ? { id: competitorId, name: seller } : null,
    ownListing: ownListingId ? { id: ownListingId, title: "Publicacion propia" } : null,
  };
}

function makeOpportunityContext({ listings = [], trackedSearches = [] } = {}) {
  return {
    project: {
      id: "project-1",
      name: "Proyecto demo",
      currencyCode: "ARS",
    },
    listings,
    trackedSearches,
  };
}

function makeTrackedSearch({ id, snapshots }) {
  return {
    id,
    name: id,
    query: id,
    isActive: true,
    snapshots,
  };
}

function makeOpportunitySearchResult({
  id,
  position,
  isOwnListing = false,
  ownListingId = null,
  competitorId = null,
  seller = null,
  price = null,
  visibleFlags = null,
  notes = null,
}) {
  return {
    id,
    position,
    observedTitle: `${seller ?? "Publicacion propia"} ejemplo`,
    observedPrice: price,
    observedSellerName: seller,
    visibleFlags,
    notes,
    isOwnListing,
    ownListingId,
    competitorId,
    competitorName: seller,
  };
}
