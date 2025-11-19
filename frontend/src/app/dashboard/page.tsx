import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDocumentsForTenant } from "@/lib/backend/documents";
import { fetchChatSessions } from "@/lib/backend/chat-logs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;

  const [documents, sessions] = await Promise.all([
    fetchDocumentsForTenant(tenantId),
    fetchChatSessions(tenantId),
  ]);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Welcome back, {session.user.name ?? session.user.email}
        </h1>
        <p className="text-sm text-neutral-500">
          Tenant ID: <span className="font-mono">{tenantId}</span>
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <article className="rounded-2xl border border-neutral-100 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Documents
          </p>
          <p className="mt-4 text-4xl font-semibold">{documents.length}</p>
          <p className="text-sm text-neutral-500">
            Indexed knowledge available to the assistant.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-100 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Chat sessions
          </p>
          <p className="mt-4 text-4xl font-semibold">{sessions.length}</p>
          <p className="text-sm text-neutral-500">
            Conversations across dashboard and embeds.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-100 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Status
          </p>
          <p className="mt-4 text-2xl font-semibold text-emerald-600">
            Running
          </p>
          <p className="text-sm text-neutral-500">
            API, worker, and storage are wired for this tenant.
          </p>
        </article>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Recent documents
        </h2>
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100">
          {documents.length === 0 && (
            <p className="px-6 py-5 text-sm text-neutral-500">
              No documents available yet. Upload a file in the Files tab to get
              started.
            </p>
          )}
          {documents.slice(0, 5).map((doc) => (
            <article key={doc.id} className="px-6 py-5 text-sm">
              <p className="font-semibold text-neutral-900">
                {doc.title ?? "Untitled document"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                {doc.status ?? "ready"}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
