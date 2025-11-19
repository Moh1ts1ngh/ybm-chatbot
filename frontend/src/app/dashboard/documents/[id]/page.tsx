import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDocumentDetail } from "@/lib/backend/document-detail";

type DocumentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;

  const { document, chunks } = await fetchDocumentDetail(tenantId, id).catch(() => {
    notFound();
  });

  if (!document) {
    notFound();
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Document
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          {document.title ?? "Untitled document"}
        </h1>
        <p className="text-xs text-neutral-500">
          Showing {chunks.length} chunks for this document.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-xs text-neutral-600">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Metadata
        </p>
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(document.metadata ?? {}, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Chunks</h2>
        <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm">
          {chunks.length === 0 && (
            <p className="text-sm text-neutral-500">
              No chunks found for this document.
            </p>
          )}
          {chunks.map((chunk) => (
            <article key={chunk.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
                Chunk #{chunk.chunkIndex}
              </p>
              <p className="whitespace-pre-line text-sm text-neutral-800">
                {chunk.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


