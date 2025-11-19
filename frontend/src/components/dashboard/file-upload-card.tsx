'use client';

import { useState, useTransition } from "react";
import { clientEnv } from "@/env/client";

type FileUploadCardProps = {
  tenantId: string;
};

type UploadState = "idle" | "requesting" | "uploading" | "ingesting" | "done" | "error";

export function FileUploadCard({ tenantId }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabled = isPending || status === "uploading" || status === "ingesting";

  async function handleUpload() {
    if (!file || disabled) return;

    startTransition(async () => {
      try {
        const mimeType = file.type || "application/octet-stream";
        setStatus("requesting");
        setMessage(null);

        const metaRes = await fetch(
          `${clientEnv.NEXT_PUBLIC_BACKEND_URL}/tenants/${tenantId}/upload-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-id": tenantId,
            },
            body: JSON.stringify({
              filename: file.name,
              mimeType,
              sizeBytes: file.size,
            }),
          },
        );

        if (!metaRes.ok) {
          throw new Error(`Failed to request upload URL (${metaRes.status})`);
        }

        const { uploadUrl, fileId } = (await metaRes.json()) as {
          uploadUrl: string;
          fileId: string;
        };

        setStatus("uploading");

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
          },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error(`Failed to upload to storage (${putRes.status})`);
        }

        setStatus("ingesting");

        const ingestRes = await fetch(
          `${clientEnv.NEXT_PUBLIC_BACKEND_URL}/files/${fileId}/ingest`,
          {
            method: "POST",
            headers: {
              "x-tenant-id": tenantId,
            },
          },
        );
        if (!ingestRes.ok) {
          throw new Error(`Failed to enqueue ingestion (${ingestRes.status})`);
        }

        setStatus("done");
        setMessage("File uploaded and ingestion queued successfully.");
        setFile(null);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Something went wrong during upload.",
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-900">Upload file</p>
          <p className="text-xs text-neutral-500">
            We recommend PDF files for now. Large files are chunked and processed by the
            worker queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,.txt,.md,.docx,.pptx"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setStatus("idle");
              setMessage(null);
            }}
            className="max-w-[220px] text-xs text-neutral-600 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-neutral-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-50"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || disabled}
            className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {status === "requesting" && "Requesting URL..."}
            {status === "uploading" && "Uploading..."}
            {status === "ingesting" && "Queueing ingestion..."}
            {status === "done" && "Upload again"}
            {status === "idle" && "Upload & ingest"}
            {status === "error" && "Retry upload"}
          </button>
        </div>
      </div>
      {message && (
        <p
          className={`text-xs ${
            status === "error" ? "text-rose-500" : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}


