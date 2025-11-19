'use server';

import { serverEnv } from "@/env/server";

type UsageRecord = {
  id: string;
  eventType: string;
  cost: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};

type UsageResponse = {
  usage?: UsageRecord[];
};

export async function fetchUsageForTenant(tenantId: string) {
  try {
    const res = await fetch(`${serverEnv.BACKEND_API_URL}/admin/usage`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    const json = (await res.json()) as UsageResponse;
    return json.usage ?? [];
  } catch (error) {
    console.warn("Failed to load usage from backend", error);
    return [];
  }
}


