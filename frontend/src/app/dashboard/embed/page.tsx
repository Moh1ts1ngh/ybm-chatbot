import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createEmbedForTenant,
  deleteEmbedForTenant,
  fetchEmbedsForTenant,
  issueEmbedTokenForTenant,
} from "@/lib/backend/embeds";
import { EmbedManager } from "@/components/dashboard/embed-manager";

export default async function EmbedPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;

  const embeds = await fetchEmbedsForTenant(tenantId);

  return (
    <EmbedManager
      tenantId={tenantId}
      initialEmbeds={embeds}
      createEmbedAction={createEmbedForTenant}
      issueTokenAction={issueEmbedTokenForTenant}
      deleteEmbedAction={deleteEmbedForTenant}
    />
  );
}


