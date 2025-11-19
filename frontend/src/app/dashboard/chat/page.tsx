import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChatConsole } from "@/components/dashboard/chat-console";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const tenantId = session.user.tenantId;
  if (!tenantId) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Playground
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Chat with your knowledge
        </h1>
        <p className="text-sm text-neutral-500">
          This console sends queries to the backend chat endpoint scoped to this
          tenant.
        </p>
      </div>

      <ChatConsole tenantId={tenantId} />
    </section>
  );
}


