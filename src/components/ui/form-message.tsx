type FormMessageProps = {
  message?: string;
  tone?: "warning" | "success";
};

const toneClasses = {
  warning: "border-warning/35 bg-warning/10 text-warning",
  success: "border-success/35 bg-success/10 text-success",
};

export function FormMessage({ message, tone = "warning" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClasses[tone]}`}>
      {message}
    </div>
  );
}
