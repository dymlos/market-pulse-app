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
