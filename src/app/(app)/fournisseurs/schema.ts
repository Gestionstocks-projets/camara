import { z } from "zod";

function optionalTrimmed() {
  return z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null));
}

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(120),
  phone: optionalTrimmed(),
  whatsapp: optionalTrimmed(),
  city: optionalTrimmed(),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : null)),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
