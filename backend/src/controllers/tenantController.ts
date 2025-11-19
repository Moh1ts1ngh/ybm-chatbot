import type { Request, Response } from "express";
import {
  createTenant,
  getTenant,
  getTenantByDomain,
} from "../services/tenantService";
import { requestUploadUrl } from "../services/ingestionService";

export async function createTenantHandler(req: Request, res: Response) {
  const { name, domain, plan } = req.body ?? {};
  if (!name) {
    return res
      .status(400)
      .json({ error: { message: "Tenant name is required" } });
  }
  const tenant = await createTenant({ name, domain, plan });
  return res.status(201).json({ tenant });
}

export async function getTenantHandler(req: Request, res: Response) {
  const tenantId = req.tenantId;
  if (!tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const tenant = await getTenant(tenantId);
  return res.json({ tenant });
}

export async function resolveTenantForEmail(req: Request, res: Response) {
  const { email, name, plan } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ error: { message: "Field 'email' is required" } });
  }

  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex === email.length - 1) {
    return res
      .status(400)
      .json({ error: { message: "Email must include a domain" } });
  }

  const domain = email.slice(atIndex + 1).toLowerCase();

  const existing = await getTenantByDomain(domain);
  if (existing) {
    return res.json({ tenant: existing });
  }

  const tenant = await createTenant({
    name: name || domain,
    domain,
    plan,
  });

  return res.status(201).json({ tenant });
}

export async function createUploadUrl(req: Request, res: Response) {
  const tenantId = req.params.tenantId;
  if (!tenantId) {
    return res
      .status(400)
      .json({ error: { message: "tenantId param is required" } });
  }

  if (req.tenantId && req.tenantId !== tenantId) {
    return res.status(403).json({ error: { message: "Tenant mismatch" } });
  }

  const { filename, mimeType, sizeBytes } = req.body ?? {};
  if (!filename) {
    return res.status(400).json({ error: { message: "filename is required" } });
  }

  const upload = await requestUploadUrl({
    tenantId,
    filename,
    mimeType,
    sizeBytes,
    uploadedBy: req.userId,
  });

  return res.json(upload);
}
