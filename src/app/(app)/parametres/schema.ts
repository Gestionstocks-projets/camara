import { z } from "zod";

function optionalTrimmed(max = 160) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));
}

export const settingsSchema = z.object({
  shop_name: z.string().trim().min(1, "Le nom de la boutique est obligatoire.").max(120),
  shop_phone: optionalTrimmed(40),
  shop_whatsapp: optionalTrimmed(40),
  shop_email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  shop_address: optionalTrimmed(240),
  invoice_prefix: z.string().trim().min(1).max(10).default("FAC"),
  managers_see_purchase_price: z.coerce.boolean(),
  managers_see_profit: z.coerce.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
