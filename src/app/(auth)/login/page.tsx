import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("shop_name, shop_logo_url")
    .single();

  return (
    <LoginForm
      shopName={settings?.shop_name ?? "Ma Boutique"}
      logoUrl={settings?.shop_logo_url ?? null}
    />
  );
}
