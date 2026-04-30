type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  muted: "border-line bg-sand/60 text-slate-600",
};

type BadgeProps = {
  children: string;
  tone?: BadgeTone;
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
