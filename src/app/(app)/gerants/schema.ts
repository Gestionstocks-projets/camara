import { z } from "zod";

export const managerSchema = z.object({
  full_name: z.string().trim().min(1, "Le nom complet est obligatoire.").max(120),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value : null)),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export type ManagerInput = z.infer<typeof managerSchema>;
