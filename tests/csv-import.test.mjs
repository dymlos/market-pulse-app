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
