import {
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  format,
} from "date-fns";

export type PeriodKey = "today" | "7d" | "30d" | "month" | "year" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Aujourd'hui",
  "7d": "7 jours",
  "30d": "30 jours",
  month: "Mois",
  year: "Année",
  custom: "Période personnalisée",
};

export interface PeriodRange {
  key: PeriodKey;
  from: string;
  to: string;
}

const DATE_FORMAT = "yyyy-MM-dd";

/**
 * Résout une période en bornes de dates (inclusives, format ISO
 * `yyyy-MM-dd`) à partir des `searchParams` de la page. Partagé par Ventes
 * (prompt 08), Dashboard (prompt 11) et les exports (prompt 13).
 */
export function resolvePeriod(
  period: string | undefined,
  from: string | undefined,
  to: string | undefined,
): PeriodRange {
  const now = new Date();
  const today = format(startOfDay(now), DATE_FORMAT);

  switch (period) {
    case "7d":
      return { key: "7d", from: format(subDays(now, 6), DATE_FORMAT), to: today };
    case "30d":
      return { key: "30d", from: format(subDays(now, 29), DATE_FORMAT), to: today };
    case "month":
      return { key: "month", from: format(startOfMonth(now), DATE_FORMAT), to: today };
    case "year":
      return { key: "year", from: format(startOfYear(now), DATE_FORMAT), to: today };
    case "custom":
      return {
        key: "custom",
        from: from || today,
        to: to || today,
      };
    case "today":
    default:
      return { key: "today", from: today, to: today };
  }
}
