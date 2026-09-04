"use client";

import { X } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export interface CartLine {
  accessoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  maxQuantity: number;
}

export function CartItemRow({
  line,
  onChangeQuantity,
  onChangePrice,
  onRemove,
}: {
  line: CartLine;
  onChangeQuantity: (quantity: number) => void;
  onChangePrice: (price: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm">
      <span className="flex-1 font-semibold">{line.name}</span>
      <input
        type="number"
        min={1}
        max={line.maxQuantity}
        value={line.quantity}
        onChange={(event) => onChangeQuantity(Math.max(1, Number(event.target.value) || 1))}
        className="h-8 w-16 rounded border border-border bg-surface px-2 text-center text-sm"
      />
      <span className="text-muted">×</span>
      <input
        type="number"
        min={0}
        value={line.unitPrice}
        onChange={(event) => onChangePrice(Math.max(0, Number(event.target.value) || 0))}
        className="h-8 w-24 rounded border border-border bg-surface px-2 text-sm"
      />
      <span className="tabular w-24 text-right font-semibold">
        {formatFCFA(line.unitPrice * line.quantity)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer"
        className="text-muted hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
