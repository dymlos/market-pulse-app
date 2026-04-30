import { NextResponse } from "next/server";

import { importMetricCsv } from "@/lib/csv/metric-import-service";
import type { MetricImportMapping } from "@/lib/csv/metric-mapping";
import type { ManualResolutionMap } from "@/lib/csv/metric-validation";

export const runtime = "nodejs";

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseJson<T>(value: string, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function readCsvFile(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Selecciona un archivo CSV.");
  }

  return {
    fileName: file.name || "metricas.csv",
    csvText: await file.text(),
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectId = getText(formData, "projectId");

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "Selecciona un proyecto para importar el CSV." },
        { status: 400 },
      );
    }

    const { fileName, csvText } = await readCsvFile(formData);
    const result = await importMetricCsv({
      projectId,
      fileName,
      csvText,
      mapping: parseJson<MetricImportMapping>(getText(formData, "mapping"), {}),
      createMissingListings: getText(formData, "createMissingListings") === "true",
      manualResolutions: parseJson<ManualResolutionMap>(getText(formData, "manualResolutions"), {}),
    });

    return NextResponse.json({ ok: result.ok, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo importar el CSV.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
