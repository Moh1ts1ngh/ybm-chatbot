import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDocumentsForTenant } from "@/lib/backend/documents";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  if (!tenantId) {
    redirect("/dashboard");
  }
  const documents = await fetchDocumentsForTenant(tenantId);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Documents
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Knowledge base
        </h1>
        <p className="text-sm text-neutral-500">
          These documents were ingested for this tenant and are available to the
          RAG pipeline.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {documents.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-xs text-neutral-500"
                >
                  No documents yet. Upload files from the{" "}
                  <Link
                    href="/dashboard/files"
                    className="font-medium text-neutral-900 underline"
                  >
                    Files
                  </Link>{" "}
                  section.
                </td>
              </tr>
            )}
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3 align-top text-neutral-900">
                  {doc.title ?? "Untitled document"}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {doc.status ?? "ready"}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/dashboard/documents/${doc.id}`}
                    className="text-xs font-medium text-neutral-900 underline"
                  >
                    View chunks
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
