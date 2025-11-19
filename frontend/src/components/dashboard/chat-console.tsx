'use client';

import { useState, useTransition } from "react";
import { clientEnv } from "@/env/client";

type ChatConsoleProps = {
  tenantId: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatConsole({ tenantId }: ChatConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    startTransition(async () => {
      try {
        const res = await fetch(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": tenantId,
          },
          body: JSON.stringify({
            message: trimmed,
            sessionId,
          }),
        });
        if (!res.ok) {
          throw new Error(`Chat backend error (${res.status})`);
        }
        const json = (await res.json()) as {
          answer: string;
          sessionId: string;
        };
        setSessionId(json.sessionId);

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: json.answer,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error(error);
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "There was an error reaching the chat backend. Please try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    });
  }

  return (
    <div className="flex h-[420px] flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-white p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-neutral-500">
            Ask a question to test retrieval against your tenant&apos;s
            documents.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your knowledge base..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || isPending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}


