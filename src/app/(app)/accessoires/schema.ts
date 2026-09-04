import { z } from "zod";

function optionalTrimmed(max = 60) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));
}

export const accessorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  category: z.enum(
    ["chargeur", "ecran", "batterie", "ecouteurs", "airpods", "coque", "cable", "autre"],
    { error: "La catégorie est obligatoire." },
  ),
  compatible_with: optionalTrimmed(80),
  supplier_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  photo_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  purchase_price: z.coerce.number().min(0, "Le prix d'achat doit être positif."),
  sale_price: z.coerce.number().min(0, "Le prix de vente doit être positif."),
  quantity_in_stock: z.coerce
    .number()
    .int()
    .min(0, "La quantité doit être positive ou nulle."),
  low_stock_threshold: z.coerce.number().int().min(0).default(3),
});

export type AccessoryInput = z.infer<typeof accessorySchema>;

/** Utilisé pour la modification par un `manager` sans droit sur le prix
 * d'achat — même logique que pour les téléphones (prompt Stock). */
export const accessoryUpdateWithoutPurchaseSchema = accessorySchema.omit({
  purchase_price: true,
});
