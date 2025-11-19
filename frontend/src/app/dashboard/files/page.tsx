import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDocumentsForTenant } from "@/lib/backend/documents";
import { FileUploadCard } from "@/components/dashboard/file-upload-card";

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  const documents = await fetchDocumentsForTenant(tenantId);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Files & Ingestion
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Upload and ingest knowledge
        </h1>
        <p className="text-sm text-neutral-500">
          Upload PDFs and other supported files. The worker will extract text,
          chunk, embed, and attach them to this tenant.
        </p>
      </div>

      <FileUploadCard tenantId={tenantId} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Recently indexed documents
        </h2>
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100">
          {documents.length === 0 && (
            <p className="px-6 py-5 text-sm text-neutral-500">
              No documents yet. Upload a file to get started.
            </p>
          )}
          {documents.map((doc) => (
            <article key={doc.id} className="px-6 py-4 text-sm">
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


