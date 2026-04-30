import { NextResponse } from "next/server";

import { buildMetricImportPreview } from "@/lib/csv/metric-import-service";

export const runtime = "nodejs";

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
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
        { ok: false, error: "Selecciona un proyecto para previsualizar el CSV." },
        { status: 400 },
      );
    }

    const { csvText } = await readCsvFile(formData);
    const preview = await buildMetricImportPreview({ projectId, csvText });

    return NextResponse.json({ ok: true, preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo previsualizar el CSV.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
