export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatRelativeDate(value: Date, reference = new Date()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const valueStart = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const referenceStart = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  ).getTime();
  const diffDays = Math.round((valueStart - referenceStart) / dayMs);
  const absDays = Math.abs(diffDays);

  if (diffDays === 0) {
    return "hoy";
  }

  if (diffDays === -1) {
    return "ayer";
  }

  if (diffDays === 1) {
    return "mañana";
  }

  if (absDays < 30) {
    return diffDays < 0 ? `hace ${absDays} días` : `en ${absDays} días`;
  }

  const months = Math.max(1, Math.round(absDays / 30));
  if (months < 12) {
    const label = months === 1 ? "mes" : "meses";
    return diffDays < 0 ? `hace ${months} ${label}` : `en ${months} ${label}`;
  }

  const years = Math.max(1, Math.round(months / 12));
  const label = years === 1 ? "año" : "años";
  return diffDays < 0 ? `hace ${years} ${label}` : `en ${years} ${label}`;
}

export function formatCurrency(value: number | null | undefined, currencyCode = "ARS") {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  return new Intl.NumberFormat("es-AR").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}%`;
}

export function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toDateTimeInputValue(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}
