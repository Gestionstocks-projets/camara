"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Smartphone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableTh,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatFCFA } from "@/lib/utils";
import {
  PHONE_CONDITION_LABELS,
  PHONE_STATUS_LABELS,
  PHONE_STATUS_TONE,
} from "@/lib/constants";
import { arrivalRangeLabel, priceRangeLabel, type PhoneGroup } from "./group-phones";

function PhoneThumbnail({ photoUrl }: { photoUrl: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />;
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-raised">
      <Smartphone className="h-4 w-4 text-muted" strokeWidth={1.5} />
    </span>
  );
}

function GroupRow({ group }: { group: PhoneGroup }) {
  const [expanded, setExpanded] = useState(false);
  const count = group.units.length;
  const isSingle = count === 1;
  const unit = group.units[0];

  const rowContent = (
    <>
      <TableCell className="font-semibold">
        <div className="flex items-center gap-2.5">
          {!isSingle ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="shrink-0 text-muted hover:text-foreground"
              aria-label={expanded ? "Réduire" : "Voir le détail des unités"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              ) : (
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          ) : null}
          <PhoneThumbnail photoUrl={group.photo_url} />
          {isSingle && unit ? (
            <Link href={`/stock/${unit.id}`} className="hover:underline">
              {group.brand} {group.model}
            </Link>
          ) : (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="text-left hover:underline">
              {group.brand} {group.model}
            </button>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isSingle && unit ? (unit.imei ?? "—") : <span className="text-muted">{count} appareils</span>}
      </TableCell>
      <TableCell>{PHONE_CONDITION_LABELS[group.condition]}</TableCell>
      <TableCell>
        <Badge tone={PHONE_STATUS_TONE[group.status]}>
          {PHONE_STATUS_LABELS[group.status]}
        </Badge>
      </TableCell>
      <TableCell>{group.storage}</TableCell>
      <TableCell>{group.ram ?? "—"}</TableCell>
      <TableCell>{group.color ?? "—"}</TableCell>
      <TableCell className="tabular">
        <span className="font-bold text-brass">{count}</span>
      </TableCell>
      <TableCell className="tabular">
        {priceRangeLabel(group.units, formatFCFA)}
      </TableCell>
      <TableCell>{arrivalRangeLabel(group.units, (d) => formatDate(d))}</TableCell>
    </>
  );

  return (
    <>
      <TableRow className={isSingle ? undefined : "cursor-pointer"}>
        {rowContent}
      </TableRow>
      {!isSingle && expanded
        ? group.units.map((phoneUnit) => (
            <TableRow key={phoneUnit.id} className="bg-surface-raised/40">
              <TableCell className="pl-11 text-muted">
                <Link
                  href={`/stock/${phoneUnit.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {group.brand} {group.model}
                </Link>
              </TableCell>
              <TableCell>{phoneUnit.imei ?? "—"}</TableCell>
              <TableCell>{PHONE_CONDITION_LABELS[phoneUnit.condition]}</TableCell>
              <TableCell>
                <Badge tone={PHONE_STATUS_TONE[phoneUnit.status]}>
                  {PHONE_STATUS_LABELS[phoneUnit.status]}
                </Badge>
              </TableCell>
              <TableCell>{phoneUnit.storage}</TableCell>
              <TableCell>{phoneUnit.ram ?? "—"}</TableCell>
              <TableCell>{phoneUnit.color ?? "—"}</TableCell>
              <TableCell>—</TableCell>
              <TableCell className="tabular">
                {formatFCFA(phoneUnit.planned_sale_price)}
              </TableCell>
              <TableCell>{formatDate(phoneUnit.arrival_date)}</TableCell>
            </TableRow>
          ))
        : null}
    </>
  );
}

export function StockTable({ groups }: { groups: PhoneGroup[] }) {
  return (
    <Table>
      <TableHead>
        <TableTh>Téléphone</TableTh>
        <TableTh>IMEI</TableTh>
        <TableTh>État</TableTh>
        <TableTh>Statut</TableTh>
        <TableTh>Stockage</TableTh>
        <TableTh>RAM</TableTh>
        <TableTh>Couleur</TableTh>
        <TableTh>Quantité</TableTh>
        <TableTh>Prix de vente</TableTh>
        <TableTh>Arrivée</TableTh>
      </TableHead>
      <TableBody>
        {groups.map((group) => (
          <GroupRow key={group.key} group={group} />
        ))}
      </TableBody>
    </Table>
  );
}
