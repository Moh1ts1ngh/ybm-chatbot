import { and, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../db/client";
import { tenants, webEmbeds } from "../db/schema";

type TenantPayload = {
  name: string;
  domain?: string;
  plan?: string;
};

type EmbedPayload = {
  tenantId: string;
  name?: string;
  config?: Record<string, unknown>;
};

export async function createTenant(payload: TenantPayload) {
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: payload.name,
      domain: payload.domain,
      plan: payload.plan ?? "free",
    })
    .returning({
      id: tenants.id,
      name: tenants.name,
      domain: tenants.domain,
      plan: tenants.plan,
    });
  if (!tenant) {
    throw new Error("Failed to create tenant");
  }
  return tenant;
}

export async function getTenant(tenantId: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
  if (!tenant) {
    return null;
  }
  return tenant;
}

export async function getTenantByDomain(domain: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.domain, domain),
  });
  if (!tenant) {
    return null;
  }
  return tenant;
}

export async function createWebEmbed(payload: EmbedPayload) {
  const [embed] = await db
    .insert(webEmbeds)
    .values({
      tenantId: payload.tenantId,
      name: payload.name,
      config: payload.config ?? {},
      embedSecret: randomBytes(24).toString("hex"),
    })
    .returning({
      id: webEmbeds.id,
      name: webEmbeds.name,
      config: webEmbeds.config,
    });
  if (!embed) {
    throw new Error("Failed to create embed");
  }
  return embed;
}

export async function getWebEmbedById(tenantId: string, embedId: string) {
  return db.query.webEmbeds.findFirst({
    where: and(eq(webEmbeds.id, embedId), eq(webEmbeds.tenantId, tenantId)),
  });
}
