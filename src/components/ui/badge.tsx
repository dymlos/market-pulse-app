type BadgeTone = "default" | "success" | "warning" | "danger" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  default: "border-line bg-panel-raised text-ink",
  success: "border-success/35 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  danger: "border-danger/35 bg-danger/10 text-danger",
  muted: "border-line bg-panel-raised text-muted",
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
