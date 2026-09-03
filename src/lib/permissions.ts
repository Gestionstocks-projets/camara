import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export interface VisibilityFlags {
  seePurchasePrice: boolean;
  seeProfit: boolean;
}

/**
 * Détermine si l'utilisateur courant voit le prix d'achat / le bénéfice.
 * Le propriétaire voit toujours tout ; pour un gérant, dépend des
 * interrupteurs de `settings` (prompt 12). Utilisé par tous les modules qui
 * affichent ou exportent ces champs (Stock, Ventes, Dashboard, Exports) —
 * ne jamais dupliquer cette logique ailleurs.
 */
export async function getVisibilityFlags(
  profile: Profile,
): Promise<VisibilityFlags> {
  if (profile.role === "owner") {
    return { seePurchasePrice: true, seeProfit: true };
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("managers_see_purchase_price, managers_see_profit")
    .single();

  return {
    seePurchasePrice: settings?.managers_see_purchase_price ?? false,
    seeProfit: settings?.managers_see_profit ?? false,
  };
}
