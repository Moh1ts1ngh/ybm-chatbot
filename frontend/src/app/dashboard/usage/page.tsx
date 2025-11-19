import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchUsageForTenant } from "@/lib/backend/usage";

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  const usage = await fetchUsageForTenant(tenantId);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Usage & Billing
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Token usage overview
        </h1>
        <p className="text-sm text-neutral-500">
          These events are recorded by the backend whenever your tenant uses
          the RAG pipeline.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {usage.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-xs text-neutral-500"
                >
                  No usage recorded yet. Chats and ingestion will start
                  populating this table.
                </td>
              </tr>
            )}
            {usage.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 align-top text-xs text-neutral-500">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-top text-sm text-neutral-900">
                  {u.eventType}
                </td>
                <td className="px-4 py-3 align-top text-xs text-neutral-700">
                  {u.cost ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


