import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "./settings-form";

export default async function ParametresPage() {
  await requireOwner();
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("*").single();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Paramètres"
        description="Réservé au propriétaire."
      />
      {settings ? <SettingsForm settings={settings} /> : null}
    </div>
  );
}
