import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMON_BRANDS, RAM_OPTIONS, STORAGE_OPTIONS } from "@/lib/constants";
import type { PhoneFilters } from "./queries";

export function FiltersBar({ filters }: { filters: PhoneFilters }) {
  return (
    <form
      method="get"
      className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-4 lg:grid-cols-8"
    >
      <select
        name="brand"
        defaultValue={filters.brand ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">Marque</option>
        {COMMON_BRANDS.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <select
        name="condition"
        defaultValue={filters.condition ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">État</option>
        <option value="neuf">Neuf</option>
        <option value="quasi_neuf">Quasi neuf</option>
      </select>
      <select
        name="status"
        defaultValue={filters.status ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">Statut</option>
        <option value="en_stock">En stock</option>
        <option value="reserve">Réservé</option>
        <option value="vendu">Vendu</option>
      </select>
      <select
        name="storage"
        defaultValue={filters.storage ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">Stockage</option>
        {STORAGE_OPTIONS.map((storage) => (
          <option key={storage} value={storage}>
            {storage}
          </option>
        ))}
      </select>
      <select
        name="ram"
        defaultValue={filters.ram ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option value="">RAM</option>
        {RAM_OPTIONS.map((ram) => (
          <option key={ram} value={ram}>
            {ram}
          </option>
        ))}
      </select>
      <input
        name="color"
        placeholder="Couleur"
        defaultValue={filters.color ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      />
      <input
        name="priceMin"
        type="number"
        placeholder="Prix min"
        defaultValue={filters.priceMin ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      />
      <input
        name="priceMax"
        type="number"
        placeholder="Prix max"
        defaultValue={filters.priceMax ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      />
      <input
        name="arrivalFrom"
        type="date"
        defaultValue={filters.arrivalFrom ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      />
      <input
        name="arrivalTo"
        type="date"
        defaultValue={filters.arrivalTo ?? ""}
        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
      />
      <Button type="submit" size="sm" variant="outline">
        <Search className="h-3.5 w-3.5" /> Filtrer
      </Button>
      <Link
        href="/stock"
        className="flex h-9 items-center justify-center rounded-md text-xs font-semibold text-muted hover:text-foreground"
      >
        Réinitialiser
      </Link>
    </form>
  );
}
