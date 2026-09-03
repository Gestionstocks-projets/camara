"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchResults } from "@/lib/search";

const SECTION_LABELS: Array<{ key: keyof SearchResults; label: string }> = [
  { key: "phones", label: "Téléphones" },
  { key: "clients", label: "Clients" },
  { key: "suppliers", label: "Fournisseurs" },
  { key: "invoices", label: "Factures" },
];

const EMPTY_RESULTS: SearchResults = { phones: [], clients: [], suppliers: [], invoices: [] };

export function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const hasResults = SECTION_LABELS.some((section) => results[section.key].length > 0);
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        placeholder="Rechercher un IMEI, un client, une facture…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {showDropdown ? (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-md border border-border bg-surface shadow-lg">
          {loading ? (
            <p className="p-3 text-sm text-muted">Recherche…</p>
          ) : hasResults ? (
            SECTION_LABELS.map((section) => {
              const items = results[section.key];
              if (items.length === 0) return null;
              return (
                <div key={section.key} className="border-b border-border last:border-b-0">
                  <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                    {section.label}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                        router.push(item.href);
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-surface-raised"
                    >
                      <span className="font-semibold">{item.title}</span>
                      {item.subtitle ? (
                        <span className="text-xs text-muted">{item.subtitle}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              );
            })
          ) : (
            <p className="p-3 text-sm text-muted">Aucun résultat pour « {query} ».</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
