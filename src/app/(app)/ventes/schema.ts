import { z } from "zod";

export const saleSchema = z
  .object({
    phone_id: z.string().uuid("Sélectionnez un téléphone."),
    client_id: z.string().uuid("Sélectionnez un client."),
    sale_date: z.string().min(1, "La date de vente est obligatoire."),
    sale_price: z.coerce.number().min(0, "Le prix de vente doit être positif."),
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
  .refine((data) => data.discount <= data.sale_price, {
    message: "La remise ne peut pas dépasser le prix de vente.",
    path: ["discount"],
  })
  .refine(
    (data) =>
      data.payment_status !== "partiel" ||
      data.amount_paid < data.sale_price - data.discount,
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
