import { z } from "zod";

function optionalTrimmed(max = 120) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));
}

export const clientSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est obligatoire.").max(80),
  last_name: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  phone: optionalTrimmed(),
  whatsapp: optionalTrimmed(),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  city: optionalTrimmed(),
});

export type ClientInput = z.infer<typeof clientSchema>;

/** Formulaire réduit réutilisé au prompt 08 (création rapide en cours de vente). */
export const quickClientSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est obligatoire.").max(80),
  last_name: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  phone: optionalTrimmed(),
});
