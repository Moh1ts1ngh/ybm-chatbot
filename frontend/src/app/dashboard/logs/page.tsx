import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchChatSessions } from "@/lib/backend/chat-logs";

export default async function ChatLogsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  const sessions = await fetchChatSessions(tenantId);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Chat Logs
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Conversations
        </h1>
        <p className="text-sm text-neutral-500">
          View historical chat sessions for this tenant. Each session captures
          both user and assistant messages.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Embed
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {sessions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-xs text-neutral-500"
                >
                  No chat sessions recorded yet. Use the Chat playground or an
                  embed to start conversations.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 align-top text-xs text-neutral-500">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-top text-xs text-neutral-700">
                  {s.embedId ?? "Dashboard"}
                </td>
                <td className="px-4 py-3 align-top text-xs text-neutral-700">
                  {s.createdBy ? "Authenticated user" : "Anonymous/embed"}
                </td>
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/dashboard/logs/${s.id}`}
                    className="text-xs font-medium text-neutral-900 underline"
                  >
                    View transcript
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


