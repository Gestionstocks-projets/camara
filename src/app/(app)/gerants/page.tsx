import { UserCog } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableTh,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { CreateManagerButton } from "./create-manager-button";
import { ToggleManagerButton } from "./toggle-manager-button";

export default async function GerantsPage() {
  await requireOwner();
  const supabase = await createClient();

  const { data: managers } = await supabase
    .from("profiles")
    .select("id, full_name, phone, disabled, created_at")
    .eq("role", "manager")
    .order("created_at", { ascending: false });

  let emailsById = new Map<string, string>();
  if (managers && managers.length > 0) {
    const admin = createAdminClient();
    const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 200 });
    emailsById = new Map(
      (usersPage?.users ?? []).map((user) => [user.id, user.email ?? "—"]),
    );
  }

  return (
    <div>
      <PageHeader
        title="Gérants"
        description="Réservé au propriétaire."
        actions={<CreateManagerButton />}
      />

      {!managers || managers.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Aucun gérant"
          description="Créez le premier compte gérant."
          action={<CreateManagerButton />}
        />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Nom</TableTh>
            <TableTh>Email</TableTh>
            <TableTh>Téléphone</TableTh>
            <TableTh>Statut</TableTh>
            <TableTh>Créé le</TableTh>
            <TableTh>Actions</TableTh>
          </TableHead>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="font-semibold">{manager.full_name}</TableCell>
                <TableCell>{emailsById.get(manager.id) ?? "—"}</TableCell>
                <TableCell>{manager.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge tone={manager.disabled ? "danger" : "success"}>
                    {manager.disabled ? "Désactivé" : "Actif"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(manager.created_at)}</TableCell>
                <TableCell>
                  <ToggleManagerButton managerId={manager.id} disabled={manager.disabled} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
