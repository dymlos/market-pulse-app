import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function MetricCard({ label, value, detail, href, icon: Icon }: MetricCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="min-h-[124px] rounded-2xl border border-line/80 bg-panel/75 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.95)] transition hover:-translate-y-0.5 hover:border-accent/55 hover:bg-panel-raised/75">
        <div className="grid h-full grid-cols-[48px_minmax(0,1fr)] gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="truncate text-sm font-semibold text-ink">{label}</div>
                <div className="mt-2 text-3xl font-semibold leading-none tracking-tight text-ink">
                  {value}
                </div>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
