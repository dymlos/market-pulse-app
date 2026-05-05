import type { Insight } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import type { HeuristicInsight, HeuristicInsightCategory } from "@/lib/causal-timeline";
import { formatDateTime } from "@/lib/format";
import {
  insightConfidenceLabels,
  insightConfidenceTone,
  insightStatusLabels,
  insightTypeLabels,
} from "@/lib/market-labels";

type ListingHeuristicInsightsProps = {
  heuristicInsights: HeuristicInsight[];
  storedInsights: Pick<Insight, "id" | "type" | "confidence" | "summary" | "recordedAt" | "status">[];
};

export function ListingHeuristicInsights({
  heuristicInsights,
  storedInsights,
}: ListingHeuristicInsightsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Lectura heuristica actual</h3>
        {heuristicInsights.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-line bg-panel-raised px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={categoryTone(insight.category)}>{insight.category}</Badge>
              <Badge tone={insightConfidenceTone(insight.confidence)}>
                {`confianza ${insightConfidenceLabels[insight.confidence]}`}
              </Badge>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-ink">{insight.title}</h4>
            <p className="mt-2 text-sm leading-6 text-muted">{insight.summary}</p>
            {insight.evidence.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs leading-5 text-muted">
                {insight.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Insights guardados</h3>
        {storedInsights.length > 0 ? (
          <div className="space-y-3">
            {storedInsights.map((insight) => (
              <article key={insight.id} className="rounded-2xl border border-line bg-panel px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{insightTypeLabels[insight.type]}</Badge>
                  <Badge tone={insightConfidenceTone(insight.confidence)}>
                    {`confianza ${insightConfidenceLabels[insight.confidence]}`}
                  </Badge>
                  <Badge tone="muted">{insightStatusLabels[insight.status]}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{insight.summary}</p>
                <div className="mt-2 text-xs text-muted">{formatDateTime(insight.recordedAt)}</div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm leading-6 text-muted">
            No hay insights guardados para esta publicacion. La lectura de la izquierda se calcula en
            tiempo de consulta y no se persiste automaticamente.
          </p>
        )}
      </div>
    </div>
  );
}

function categoryTone(category: HeuristicInsightCategory) {
  if (category === "probable") {
    return "success" as const;
  }

  if (category === "posible" || category === "mixta") {
    return "warning" as const;
  }

  return "muted" as const;
}
