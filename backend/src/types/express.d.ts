import type { Request } from "express";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      tenantId?: string;
      userId?: string;
    }
  }
}

export type AugmentedRequest = Request;

