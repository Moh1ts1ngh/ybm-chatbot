'use client';

import { useState, useTransition } from "react";

type Embed = {
  id: string;
  name: string | null;
  config: Record<string, unknown>;
  createdAt: string;
};

type EmbedManagerProps = {
  tenantId: string;
  initialEmbeds: Embed[];
  createEmbedAction: (tenantId: string, name: string) => Promise<Embed>;
  issueTokenAction: (
    tenantId: string,
    embedId: string,
    domains: string[],
  ) => Promise<{ token: string; expiresIn: number }>;
  deleteEmbedAction: (tenantId: string, embedId: string) => Promise<void>;
};

export function EmbedManager({
  tenantId,
  initialEmbeds,
  createEmbedAction,
  issueTokenAction,
  deleteEmbedAction,
}: EmbedManagerProps) {
  const [embeds, setEmbeds] = useState<Embed[]>(initialEmbeds);
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [selectedEmbedId, setSelectedEmbedId] = useState<string | null>(
    initialEmbeds[0]?.id ?? null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copySnippetLabel, setCopySnippetLabel] =
    useState<string>("Copy snippet");
  const [copyTokenLabel, setCopyTokenLabel] = useState<string>("Copy token");

  const selectedEmbed = embeds.find((e) => e.id === selectedEmbedId) ?? null;

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const created = await createEmbedAction(tenantId, trimmed);
      setEmbeds((prev) => [created, ...prev]);
      setSelectedEmbedId(created.id);
      setName("");
    });
  }

  function handleIssueToken() {
    if (!selectedEmbed) return;
    const parsedDomains = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    startTransition(async () => {
      const res = await issueTokenAction(tenantId, selectedEmbed.id, parsedDomains);
      setToken(res.token);
    });
  }

  function handleCopy(text: string, target: "snippet" | "token") {
    void navigator.clipboard.writeText(text).then(() => {
      if (target === "snippet") {
        setCopySnippetLabel("Copied!");
        setTimeout(() => setCopySnippetLabel("Copy snippet"), 1500);
      } else {
        setCopyTokenLabel("Copied!");
        setTimeout(() => setCopyTokenLabel("Copy token"), 1500);
      }
    });
  }

  function handleDelete(embedId: string) {
    startTransition(async () => {
      await deleteEmbedAction(tenantId, embedId);
      setEmbeds((prev) => prev.filter((e) => e.id !== embedId));
      if (selectedEmbedId === embedId) {
        const next = embeds.find((e) => e.id !== embedId) ?? null;
        setSelectedEmbedId(next?.id ?? null);
        setToken(null);
      }
    });
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-500">
          Embeds
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Configure and install your widget
        </h1>
        <p className="text-sm text-neutral-500">
          Create an embed for each surface (marketing site, docs, app) and drop
          the snippet into your codebase. Use the token endpoint for extra
          security.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              New embed
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Marketing site"
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
              />
              <button
                type="button"
                disabled={!name.trim() || isPending}
                onClick={handleCreate}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Existing embeds
            </p>
            {embeds.length === 0 && (
              <p className="text-xs text-neutral-500">
                No embeds yet. Create one to generate a snippet and tokens.
              </p>
            )}
            <ul className="space-y-1">
              {embeds.map((embed) => (
                <li key={embed.id}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmbedId(embed.id);
                        setToken(null);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-left text-xs ${
                        embed.id === selectedEmbedId
                          ? "bg-neutral-900 text-white"
                          : "bg-white text-neutral-800 hover:bg-neutral-100"
                      }`}
                    >
                      <span className="block truncate font-medium">
                        {embed.name ?? "Untitled embed"}
                      </span>
                      <span className="block font-mono text-[10px] text-neutral-400 break-all">
                        {embed.id}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(embed.id)}
                      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {selectedEmbed ? (
            <>
              <div className="space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Embed snippet
                </p>
                <p className="text-xs text-neutral-500">
                  Drop this snippet into your site. Replace the{" "}
                  <code className="rounded bg-neutral-200 px-1 py-0.5">
                    src
                  </code>{" "}
                  URL with your deployed frontend.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `<script
  src="https://your-frontend-domain.com/embed.js"
  data-embed-id="${selectedEmbed.id}"
></script>`,
                      "snippet",
                    )
                  }
                  className="mb-2 rounded-md border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  {copySnippetLabel}
                </button>
                <pre className="overflow-x-auto rounded-lg bg-black px-3 py-3 text-[11px] text-neutral-100">
{`<script
  src="https://your-frontend-domain.com/embed.js"
  data-embed-id="${selectedEmbed.id}"
></script>`}
                </pre>
              </div>

              <div className="space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Issue short-lived token
                </p>
                <p className="text-xs text-neutral-500">
                  Optionally restrict embeds to specific domains. Provide a
                  comma-separated list:
                  <br />
                  <span className="font-mono text-[10px]">
                    app.example.com, marketing.example.com
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={domains}
                    onChange={(event) => setDomains(event.target.value)}
                    placeholder="Allowed domains (optional)"
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleIssueToken}
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {isPending ? "Issuing..." : "Generate token"}
                  </button>
                </div>
                {token && (
                  <div className="space-y-1 rounded-lg bg-black px-3 py-3 text-[11px] text-neutral-100">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-mono text-[10px] text-neutral-400">
                        Embed token (JWT)
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(token, "token")}
                        className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-neutral-100 hover:bg-neutral-800"
                      >
                        {copyTokenLabel}
                      </button>
                    </div>
                    <pre className="overflow-x-auto break-all">{token}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-500">
              Create an embed on the left to see the installation snippet and
              token tooling.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


