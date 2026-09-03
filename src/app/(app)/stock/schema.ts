import { z } from "zod";

function optionalTrimmed(max = 60) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));
}

export const phoneSchema = z.object({
  brand: z.string().trim().min(1, "La marque est obligatoire.").max(60),
  model: z.string().trim().min(1, "Le modèle est obligatoire.").max(80),
  imei: z
    .string()
    .trim()
    .min(14, "L'IMEI doit contenir au moins 14 chiffres.")
    .max(17)
    .regex(/^\d+$/, "L'IMEI ne doit contenir que des chiffres."),
  condition: z.enum(["neuf", "quasi_neuf"], {
    error: "L'état est obligatoire.",
  }),
  ram: optionalTrimmed(20),
  storage: z.string().trim().min(1, "Le stockage est obligatoire.").max(20),
  color: optionalTrimmed(40),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  supplier_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  arrival_date: z.string().min(1, "La date d'arrivée est obligatoire."),
  purchase_price: z.coerce.number().min(0, "Le prix d'achat doit être positif."),
  extra_fees: z.coerce.number().min(0).default(0),
  planned_sale_price: z.coerce
    .number()
    .min(0, "Le prix de vente doit être positif."),
});

export type PhoneInput = z.infer<typeof phoneSchema>;

/**
 * Utilisé pour la modification par un `manager` sans droit sur le prix
 * d'achat (`managers_see_purchase_price = false`, prompt 12) : ces champs
 * sont alors absents du formulaire (jamais pré-remplis, jamais renvoyés),
 * donc absents de `formData` — on ne doit ni les exiger, ni risquer de les
 * écraser avec une valeur vide.
 */
export const phoneUpdateWithoutPurchaseSchema = phoneSchema.omit({
  purchase_price: true,
  extra_fees: true,
});
