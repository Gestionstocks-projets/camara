import { z } from "zod";

function optionalTrimmed(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} ne doit pas dépasser ${max} caractères.`)
    .optional()
    .transform((value) => (value ? value : null));
}

/**
 * Un IMEI (téléphone) ou un numéro de série (ordinateur, tablette…) — la
 * boutique enregistre les deux types d'appareils dans la même fiche.
 * Volontairement permissif (lettres + chiffres, 5 à 30 caractères) : un
 * IMEI classique fait 15 chiffres, mais un numéro de série Apple contient
 * des lettres, et certains téléphones double-SIM ont deux IMEI accolés.
 */
export const imeiSchema = z
  .string()
  .trim()
  .min(5, "L'IMEI / numéro de série doit contenir au moins 5 caractères.")
  .max(30, "L'IMEI / numéro de série ne doit pas dépasser 30 caractères.")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9 \-/]*$/,
    "L'IMEI / numéro de série ne peut contenir que des lettres, chiffres, espaces, tirets et barres obliques.",
  );

export const phoneSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, "La marque est obligatoire.")
    .max(60, "La marque ne doit pas dépasser 60 caractères."),
  model: z
    .string()
    .trim()
    .min(1, "Le modèle est obligatoire.")
    .max(80, "Le modèle ne doit pas dépasser 80 caractères."),
  /** Optionnel (prompt 16) : la boutique n'a pas toujours le numéro sous
   * la main à la réception, surtout pour un lot de plusieurs unités
   * identiques — il peut être ajouté plus tard depuis la fiche. */
  imei: imeiSchema
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  condition: z.enum(["neuf", "quasi_neuf"], {
    error: "L'état est obligatoire.",
  }),
  ram: optionalTrimmed(20, "La RAM"),
  storage: z
    .string()
    .trim()
    .min(1, "Le stockage est obligatoire.")
    .max(20, "Le stockage ne doit pas dépasser 20 caractères."),
  color: optionalTrimmed(40, "La couleur"),
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

/**
 * Champs d'un lot d'appareils identiques (prompt 15) : la création ne
 * demande plus l'IMEI (prompt 16, pas nécessaire pour enregistrer vite un
 * arrivage) — juste les infos communes, dupliquées sur `quantity` lignes.
 * L'IMEI de chaque unité pourra être renseigné plus tard depuis sa fiche.
 */
export const phoneBatchSharedSchema = phoneSchema.omit({ imei: true });

export const quantitySchema = z.coerce
  .number({ error: "La quantité est obligatoire." })
  .int("La quantité doit être un nombre entier.")
  .min(1, "La quantité doit être d'au moins 1.")
  .max(500, "La quantité ne doit pas dépasser 500 à la fois.");
