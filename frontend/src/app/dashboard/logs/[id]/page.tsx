import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchChatSessionDetail } from "@/lib/backend/chat-logs";

type ChatLogDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatLogDetailPage({
  params,
}: ChatLogDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  const { session: sess, messages } = await fetchChatSessionDetail(
    tenantId,
    id,
  );

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Chat Transcript
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Session {sess.id.slice(0, 8)}…
        </h1>
        <p className="text-xs text-neutral-500">
          Started at {new Date(sess.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex h-[460px] flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-white p-3 text-sm">
          {messages.length === 0 && (
            <p className="text-xs text-neutral-500">
              No messages recorded for this session.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                  m.sender === "user"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  {m.sender}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


