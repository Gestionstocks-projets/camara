import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  variant?: "default" | "accent" | "brass";
  hint?: string;
}

export function StatTile({
  label,
  value,
  variant = "default",
  hint,
}: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1.5 font-display text-xl font-bold",
          variant === "accent" && "text-accent",
          variant === "brass" && "text-brass",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
