import { z } from "zod";

export const cartItemSchema = z.object({
  accessory_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().min(0),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const saleSchema = z
  .object({
    phone_id: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : null)),
    client_id: z.string().uuid("Sélectionnez un client."),
    sale_date: z.string().min(1, "La date de vente est obligatoire."),
    sale_price: z.coerce.number().min(0).default(0),
    cart: z
      .string()
      .transform((value, ctx) => {
        try {
          const parsed = JSON.parse(value);
          const result = z.array(cartItemSchema).safeParse(parsed);
          if (!result.success) {
            ctx.addIssue({ code: "custom", message: "Panier d'accessoires invalide." });
            return z.NEVER;
          }
          return result.data;
        } catch {
          ctx.addIssue({ code: "custom", message: "Panier d'accessoires invalide." });
          return z.NEVER;
        }
      })
      .default([]),
    discount: z.coerce.number().min(0).default(0),
    payment_method: z.enum(
      ["especes", "orange_money", "wave", "carte", "autre"],
      { error: "Le mode de paiement est obligatoire." },
    ),
    warranty: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value ? value : null)),
    payment_status: z.enum(["paye", "partiel", "en_attente"], {
      error: "Le statut de paiement est obligatoire.",
    }),
    amount_paid: z.coerce.number().min(0).default(0),
  })
  .refine((data) => data.phone_id !== null || data.cart.length > 0, {
    message: "Sélectionnez un téléphone et/ou ajoutez au moins un accessoire.",
    path: ["phone_id"],
  })
  .refine(
    (data) => {
      const accessoriesTotal = data.cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      return data.discount <= data.sale_price + accessoriesTotal;
    },
    { message: "La remise ne peut pas dépasser le total du panier.", path: ["discount"] },
  )
  .refine(
    (data) => {
      const accessoriesTotal = data.cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      const total = data.sale_price + accessoriesTotal - data.discount;
      return data.payment_status !== "partiel" || data.amount_paid < total;
    },
    {
      message: "Pour un paiement partiel, le montant payé doit être inférieur au total.",
      path: ["amount_paid"],
    },
  );

export type SaleInput = z.infer<typeof saleSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Le montant doit être positif."),
  method: z.enum(["especes", "orange_money", "wave", "carte", "autre"]),
});
