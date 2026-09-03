"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PERIOD_LABELS, type PeriodKey } from "@/lib/period";

const ORDER: PeriodKey[] = ["today", "7d", "30d", "month", "year", "custom"];

export function PeriodFilter({ current }: { current: PeriodKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(period: PeriodKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    if (period !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function setCustomDate(field: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set(field, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1">
        {ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              current === key
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-raised hover:text-foreground"
            }`}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>
      {current === "custom" ? (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(event) => setCustomDate("from", event.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-xs"
          />
          <span className="text-xs text-muted">→</span>
          <input
            type="date"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(event) => setCustomDate("to", event.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-xs"
          />
        </div>
      ) : null}
    </div>
  );
}
