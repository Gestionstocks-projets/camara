import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("shop_name")
    .single();

  return (
    <AppShell profile={profile} shopName={settings?.shop_name ?? "Ma Boutique"}>
      {children}
    </AppShell>
  );
}
