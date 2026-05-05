type FormMessageProps = {
  message?: string;
};

export function FormMessage({ message }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm leading-6 text-warning">
      {message}
    </div>
  );
}
